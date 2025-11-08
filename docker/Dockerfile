FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for document processing
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    poppler-utils \
    tesseract-ocr \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    streamlit==1.28.2 \
    requests==2.31.0 \
    python-dotenv==1.0.0 \
    psycopg2-binary==2.9.9 \
    minio==7.2.0 \
    PyPDF2==3.0.1 \
    python-docx==1.1.0 \
    python-pptx==0.6.23 \
    openpyxl==3.1.2 \
    pandas==2.1.3 \
    watchdog==3.0.0

COPY . .

EXPOSE 8501

HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]