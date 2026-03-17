from fastapi import FastAPI, Form, BackgroundTasks
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import smtplib
import warnings
import re
from email.message import EmailMessage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.pdfgen import canvas
from datetime import datetime

# Suprimir todos los warnings de matplotlib
warnings.filterwarnings('ignore')
plt.switch_backend('Agg')  # usar backend sin GUI

# estado de usuarios (por teléfono)
users = {}

# configuración de correo (hardcodeado a petición del usuario)
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")

def send_report_email(to_email, report_path):
    """Envía el informe PDF al correo especificado usando SMTP.
    Si no hay credenciales válidas, devuelve False pero no detiene el flujo."""
    try:
        if not EMAIL_USER or not EMAIL_PASS:
            print("Advertencia: configurar EMAIL_USER y EMAIL_PASS como variables de entorno")
            return False
        
        msg = EmailMessage()
        msg['Subject'] = 'Informe exploratorio de datos'
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg.set_content('Adjunto el informe solicitado.')
        with open(report_path, 'rb') as f:
            data = f.read()
        msg.add_attachment(data, maintype='application', subtype='pdf', filename=os.path.basename(report_path))
        # utilizar servidor SMTP de Gmail como ejemplo
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error enviando correo: {e}")
        return False

app = FastAPI()

# 🔑 Credenciales Twilio (hardcodeado a petición del usuario)
account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
client = Client(account_sid, auth_token) if account_sid and auth_token else None


def send_whatsapp_message(to_phone: str, from_phone: str, body: str) -> bool:
    """Envio proactivo via REST API (sirve para tareas largas que no pueden bloquear el webhook)."""
    try:
        if not client:
            print("Twilio client no configurado (faltan credenciales).")
            return False
        if not to_phone or not from_phone:
            print(f"Faltan parametros para envio: to={to_phone!r} from={from_phone!r}")
            return False
        client.messages.create(
            to=to_phone,
            from_=from_phone,
            body=body,
        )
        return True
    except Exception as e:
        print(f"Error enviando WhatsApp via Twilio REST: {e}")
        return False


def _chunk_text(text: str, max_len: int = 1400) -> list[str]:
    chunks = []
    current = ""
    for part in text.split(", "):
        candidate = part if not current else f"{current}, {part}"
        if len(candidate) > max_len:
            if current:
                chunks.append(current)
            current = part
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def _process_dataset_load(phone: str):
    state = users.get(phone)
    if not state:
        return

    url = state.get("url")
    fmt = state.get("format")
    to_phone = state.get("to")  # Twilio number (inbound "To")

    try:
        if fmt == "csv":
            df = pd.read_csv(url)
        else:
            df = pd.read_excel(url)

        state["df"] = df
        cols = list(df.columns)
        state["stage"] = "ask_quant"

        send_whatsapp_message(phone, to_phone, "Conjunto de datos cargados.")
        send_whatsapp_message(phone, to_phone, "Se tiene las siguientes columnas:")
        cols_text = ", ".join(map(str, cols))
        for chunk in _chunk_text(cols_text):
            send_whatsapp_message(phone, to_phone, chunk)
        send_whatsapp_message(phone, to_phone, "Indique sus columnas cuantitativas.")
    except Exception as e:
        state["stage"] = "ask_url"
        send_whatsapp_message(phone, to_phone, f"Error cargando datos: {e}")
        send_whatsapp_message(phone, to_phone, "Copie el link de la data nuevamente.")


def _process_pdf_generation(phone: str):
    state = users.get(phone)
    if not state:
        return

    to_phone = state.get("to")
    try:
        generate_pdf(state)
        state["stage"] = "ask_email"
        send_whatsapp_message(phone, to_phone, "Informe generado.")
        send_whatsapp_message(phone, to_phone, f"Indique su correo señor {state.get('name','')}.")
    except Exception as e:
        state["stage"] = "ask_qual"
        send_whatsapp_message(phone, to_phone, f"Error generando informe: {e}")
        send_whatsapp_message(phone, to_phone, "Indique sus columnas cualitativas nuevamente.")


def _process_email_send(phone: str):
    state = users.get(phone)
    if not state:
        return

    to_phone = state.get("to")
    report_path = state.get("report")

    if not report_path:
        state["stage"] = "ask_email"
        send_whatsapp_message(phone, to_phone, "No se encontró el informe para envío. Indique su correo nuevamente.")
        return

    success = send_report_email(state.get("email", ""), report_path)
    if success:
        send_whatsapp_message(phone, to_phone, "Informe enviado correctamente.")
    else:
        send_whatsapp_message(
            phone,
            to_phone,
            "El informe PDF fue generado. Para activar envío por email, configure las credenciales SMTP.",
        )

    state["stage"] = "done"
    send_whatsapp_message(phone, to_phone, f"Muchas gracias por usar nuestros servicios señor {state.get('name','')}.")


def sanitize_filename(name):
    """Elimina caracteres especiales del nombre para evitar errores de encoding."""
    # Reemplazar caracteres acentuados
    name = name.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    name = name.replace('Á', 'A').replace('É', 'E').replace('Í', 'I').replace('Ó', 'O').replace('Ú', 'U')
    name = name.replace('ñ', 'n').replace('Ñ', 'N')
    # Reemplazar caracteres no-alphanumericós
    name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
    return name[:50]  # limitar longitud

def generate_pdf(data):
    """Genera un informe PDF profesional con estadísticas y gráficos."""
    safe_name = sanitize_filename(data.get('name', 'usuario'))
    fname = f"report_{safe_name}.pdf"
    # guardar ruta en cualquier caso para que el bot pueda encontrarla
    data['report'] = fname
    df = data.get('df')
    
    try:
        doc = SimpleDocTemplate(fname, pagesize=letter,
                              rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.75*inch, bottomMargin=0.75*inch)
        story = []
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(name='CustomTitle', parent=styles['Heading1'],
                                     fontSize=22, textColor=colors.HexColor('#1f4788'),
                                     spaceAfter=8, alignment=1)  # centrado
        heading_style = ParagraphStyle(name='CustomHeading', parent=styles['Heading2'],
                                       fontSize=14, textColor=colors.HexColor('#4472C4'),
                                       spaceAfter=6)
        
        # Título
        story.append(Paragraph("INFORME EXPLORATORIO DE DATOS", title_style))
        story.append(Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        if df is not None:
            # Información General
            story.append(Paragraph("1. INFORMACIÓN GENERAL", heading_style))
            general_data = [
                ['Atributo', 'Valor'],
                ['Total de filas', str(len(df))],
                ['Total de columnas', str(len(df.columns))],
                ['Columnas numéricas', str(len(df.select_dtypes(include=[np.number]).columns))],
                ['Columnas texto', str(len(df.select_dtypes(include=['object']).columns))],
                ['Valores faltantes', str(df.isnull().sum().sum())]
            ]
            general_table = Table(general_data, colWidths=[3*inch, 3.5*inch])
            general_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#E7E6E6')])
            ]))
            story.append(general_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Estadísticas por columna numérica
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()[:10]
            if numeric_cols:
                story.append(Paragraph("2. ESTADÍSTICAS DE COLUMNAS NUMÉRICAS", heading_style))
                for col in numeric_cols:
                    try:
                        series = df[col].dropna()
                        if len(series) > 0:
                            safe_col = sanitize_filename(col)
                            # Tabla de estadísticas
                            stats_data = [
                                ['Estadístico', f'{col[:30]}'],
                                ['Media', f"{series.mean():.4f}"],
                                ['Mediana', f"{series.median():.4f}"],
                                ['Desv. Estándar', f"{series.std():.4f}"],
                                ['Mínimo', f"{series.min():.4f}"],
                                ['Máximo', f"{series.max():.4f}"],
                                ['Q1 (25%)', f"{series.quantile(0.25):.4f}"],
                                ['Q3 (75%)', f"{series.quantile(0.75):.4f}"]
                            ]
                            stats_table = Table(stats_data, colWidths=[2.5*inch, 4*inch])
                            stats_table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D9E1F2')),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('FONTSIZE', (0, 0), (-1, -1), 9),
                                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
                            ]))
                            story.append(stats_table)
                            story.append(Spacer(1, 0.15*inch))
                            
                            # Generar gráficos si hay pocos valores únicos
                            counts = series.value_counts()
                            if len(counts) <= 20:
                                try:
                                    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7, 2.5))
                                    counts.plot(kind='bar', ax=ax1, color='#4472C4')
                                    ax1.set_title('Frecuencia Absoluta')
                                    ax1.set_ylabel('Cantidad')
                                    ax1.tick_params(axis='x', rotation=45)
                                    
                                    rel = counts / counts.sum()
                                    rel.plot(kind='pie', ax=ax2, autopct='%1.1f%%', colors=plt.cm.Set3.colors)
                                    ax2.set_title('Frecuencia Relativa')
                                    ax2.set_ylabel('')
                                    
                                    fig.tight_layout()
                                    img_path = f"temp_{safe_col}.png"
                                    fig.savefig(img_path, dpi=100, bbox_inches='tight')
                                    plt.close(fig)
                                    
                                    story.append(Image(img_path, width=6.5*inch, height=2.2*inch))
                                    story.append(Spacer(1, 0.2*inch))
                                    os.remove(img_path)
                                except Exception as e:
                                    print(f"Error gráfico {col}: {e}")
                    except Exception as col_err:
                        print(f"Error procesando {col}: {col_err}")
                        continue
            
            # Columnas categóricas
            cat_cols = df.select_dtypes(include=['object']).columns.tolist()[:5]
            if cat_cols:
                story.append(PageBreak())
                story.append(Paragraph("3. ANÁLISIS DE COLUMNAS CATEGÓRICAS", heading_style))
                for col in cat_cols:
                    try:
                        series = df[col].dropna()
                        if len(series) > 0:
                            safe_col = sanitize_filename(col)
                            counts = series.value_counts().head(10)
                            
                            cat_data = [['Valor', 'Frecuencia', 'Porcentaje']]
                            total = counts.sum()
                            for val, cnt in counts.items():
                                pct = (cnt / total) * 100
                                cat_data.append([str(val)[:30], str(cnt), f"{pct:.1f}%"])
                            
                            cat_table = Table(cat_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
                            cat_table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#70AD47')),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('FONTSIZE', (0, 0), (-1, -1), 9),
                                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#E2EFD9')])
                            ]))
                            story.append(Paragraph(f"<b>{col[:40]}</b>", styles['Normal']))
                            story.append(cat_table)
                            story.append(Spacer(1, 0.25*inch))
                    except Exception as col_err:
                        print(f"Error procesando categoría {col}: {col_err}")
                        continue
        
        # Pie de página
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(f"<i>Generado automáticamente por Análisis de Datos</i>", styles['Normal']))
        
        doc.build(story)
        data['report'] = fname
        print(f"PDF generado exitosamente: {fname}")
    except Exception as e:
        print(f"Error crítico generando PDF: {e}")
        pass


@app.post("/whatsapp")
@app.post("/whatsapp/")
async def responder(Body: str = Form(...), From: str = Form(...), To: str = Form(None), background_tasks: BackgroundTasks = None):
    msg = Body.lower().strip()
    resp = MessagingResponse()
    phone = From

    # BackgroundTasks se inyecta por FastAPI; este fallback permite ejecutar la app tambien fuera del request-cycle.
    if background_tasks is None:
        background_tasks = BackgroundTasks()

    # DEBUG: registrar cada solicitud
    print(f"Received from {phone} to {To}: '{Body}' (normalized '{msg}')")

    # reiniciar la conversación si el usuario saluda de nuevo o si ya había terminado
    if 'hola' in msg or 'hi' in msg or 'hello' in msg:
        users.pop(phone, None)
    elif phone in users and users[phone].get('stage') == 'done':
        users.pop(phone, None)

    # inicializa el estado si es nuevo
    if phone not in users:
        users[phone] = {'stage': 'greet'}
    state = users[phone]

    # guardar a que numero de Twilio llego el inbound (para poder responder proactivamente)
    if To:
        state["to"] = To

    if state['stage'] == 'greet':
        resp.message("¿hola como estas? ¿Como te llamas?")
        state['stage'] = 'ask_name'

    elif state["stage"] == "loading_data":
        resp.message("Sigo cargando tu data. En cuanto termine te escribo con las columnas.")

    elif state["stage"] == "generating_pdf":
        resp.message("Sigo generando el PDF. Te aviso apenas esté listo.")

    elif state["stage"] == "sending_email":
        resp.message("Sigo enviando el informe al correo. Te confirmo apenas termine.")

    elif state['stage'] == 'ask_name':
        state['name'] = Body.strip()
        resp.message("¿Deseas realizar un análisis exploratorio de datos? Si o no")
        state['stage'] = 'ask_analysis'

    elif state['stage'] == 'ask_analysis':
        if 'si' in msg:
            resp.message(
                "1.-Datos medianos o pequeños con Pandas con CSV\n"
                "2.-Datos medianos o pequeños con Pandas con XLSX"
            )
            state['stage'] = 'ask_format'
        else:
            resp.message("Gracias por usar nuestros servicios")
            state['stage'] = 'done'

    elif state['stage'] == 'ask_format':
        if '1' in msg:
            state['format'] = 'csv'
        elif '2' in msg:
            state['format'] = 'xlsx'
        else:
            resp.message("Por favor elija 1 o 2")
            return Response(content=str(resp), media_type="application/xml")
        resp.message("Copie el link de la data")
        state['stage'] = 'ask_url'

    elif state['stage'] == 'ask_url':
        url = Body.strip()
        state['url'] = url
        # IMPORTANTE: no bloquear el webhook. Twilio requiere respuesta rapida (si no, no entrega el mensaje).
        resp.message("Recibido. Estoy cargando tu data y te aviso en breve...")
        state["stage"] = "loading_data"
        background_tasks.add_task(_process_dataset_load, phone)

    elif state['stage'] == 'ask_quant':
        state['quant'] = Body.strip()
        resp.message("Indique sus columnas cualitativas")
        state['stage'] = 'ask_qual'

    elif state['stage'] == 'ask_qual':
        state['qual'] = Body.strip()
        resp.message("Generando análisis exploratorio en un informe en PDF. Te aviso apenas esté listo...")
        state["stage"] = "generating_pdf"
        background_tasks.add_task(_process_pdf_generation, phone)

    elif state['stage'] == 'ask_email':
        state['email'] = Body.strip()
        resp.message("Recibido. Estoy enviando el informe a tu correo y te confirmo por aquí...")
        state["stage"] = "sending_email"
        background_tasks.add_task(_process_email_send, phone)

    else:
        resp.message("Gracias. Si necesita algo más, escriba 'hola'")

    return Response(content=str(resp), media_type="application/xml", background=background_tasks)
