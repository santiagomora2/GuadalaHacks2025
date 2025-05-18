# backend/Dockerfile
FROM python:3.9-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requisitos e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Crear directorio data (para la persistencia de datos en el Docker)
RUN mkdir -p /data

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["python", "app.py"]