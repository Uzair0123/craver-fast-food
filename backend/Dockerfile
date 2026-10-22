FROM python:3.11-alpine

WORKDIR /app

# Step 1: Two-Step Dependency Copy for maximum layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 2: Application source code
COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
