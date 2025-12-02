# ใช้ Python 3.11 slim image
FROM python:3.11-slim

# ตั้งค่า environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ตั้งค่า working directory
WORKDIR /app

# ติดตั้ง system dependencies สำหรับ MySQL
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# คัดลอก requirements.txt และติดตั้ง Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# คัดลอกโค้ดทั้งหมดเข้า container
COPY . /app/

# คัดลอก entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# สร้างโฟลเดอร์สำหรับ static files
RUN mkdir -p /app/staticfiles

# Expose port 8000
EXPOSE 8000

# ใช้ entrypoint script เพื่อรอ MySQL พร้อมก่อนรัน Django
ENTRYPOINT ["/app/entrypoint.sh"]
