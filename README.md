# Ultimate Yo-kai Watch Favorite Picker

Selector de favoritos Yo-kai con matriz por juego y tribu.

## Uso local

Abre `index.html` con un servidor local (recomendado) para evitar restricciones del navegador con módulos ES:

```bash
npx --yes serve .
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `fav-yo-kai-picker`).
2. En la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit: Yo-kai favorite picker"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fav-yo-kai-picker.git
git push -u origin main
```

3. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Tras el primer push, el workflow **Deploy to GitHub Pages** publicará el sitio.
5. La URL será `https://TU_USUARIO.github.io/fav-yo-kai-picker/` (o la raíz si el repo se llama `TU_USUARIO.github.io`).

## Imágenes

Las URLs de Imgur se cargan directamente desde `i.imgur.com`. Si una imagen falla, la app prueba otras extensiones y, como último recurso, un proxy.
