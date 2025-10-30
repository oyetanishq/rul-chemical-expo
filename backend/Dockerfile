FROM python:3.9-slim

WORKDIR /app

# Install each dependency separately
RUN pip install --no-cache-dir bottle==0.13.3
RUN pip install --no-cache-dir numpy==1.26.4
RUN pip install --no-cache-dir tensorflow==2.16.2
RUN pip install --no-cache-dir bottle_cors_plugin==0.1.9
RUN pip install --no-cache-dir joblib==1.5.2
RUN pip install --no-cache-dir scikit-learn==1.5.2

COPY . /app

EXPOSE 3000

CMD ["python", "app.py"]
