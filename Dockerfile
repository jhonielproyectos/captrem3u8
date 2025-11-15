# Usar la imagen oficial de Playwright con Node.js y los navegadores instalados.
FROM mcr.microsoft.com/playwright/node:latest

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el código del servidor
COPY server.js .

# Exponer el puerto que Express escuchará
EXPOSE 10000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]
