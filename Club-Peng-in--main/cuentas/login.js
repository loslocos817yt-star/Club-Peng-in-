const AuthSystem = {
    token: "",
    repo: "loslocos817yt-star/Club-Peng-in-",
    path: "cuentas/usuarios/cuentas.json",
    db: [],
    sha: "",

    async inicializar() {
        try {
            const resHash = await fetch('cuentas/api.hash');
            const binario = await resHash.text();
            this.token = binario.trim().match(/.{1,8}/g).map(byte => 
                String.fromCharCode(parseInt(byte, 2))
            ).join("");

            // Añadimos un timestamp para evitar que el navegador use una versión vieja (cache)
            const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}?t=${Date.now()}`, {
                headers: { "Authorization": `token ${this.token}` }
            });
            const data = await res.json();
            this.sha = data.sha;
            this.db = JSON.parse(atob(data.content));
            console.log("DB cargada correctamente");
        } catch (e) {
            console.error("Error inicializando:", e);
        }
    },

    async autenticar(nombre, pass, isRegister) {
        // Buscamos siempre después de asegurar que la DB existe
        let user = this.db.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());

        if (isRegister) {
            if (user) {
                alert("Ese nombre ya lo ganaron");
                return null;
            }
            user = { 
                nombre: nombre, 
                pass: pass, 
                monedas: 500, 
                posicion: { x: 450, y: 350 }, 
                items: [] 
            };
            this.db.push(user);
            // IMPORTANTE: Esperamos a que GitHub confirme antes de dejarlo pasar
            const exito = await this.guardarEnGitHub(`Nuevo usuario: ${nombre}`);
            return exito ? user : null;
        } else {
            if (!user || user.pass !== pass) {
                alert("Usuario o clave mal");
                return null;
            }
            return user;
        }
    },

    async guardarEnGitHub(mensaje) {
        const url = `https://api.github.com/repos/${this.repo}/contents/${this.path}`;
        const body = {
            message: mensaje,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(this.db, null, 2)))),
            sha: this.sha
        };

        const res = await fetch(url, {
            method: "PUT",
            headers: { 
                "Authorization": `token ${this.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            const resData = await res.json();
            this.sha = resData.content.sha; // Actualizamos el SHA para la siguiente operación
            return true;
        } else {
            console.error("Error al subir:", await res.json());
            alert("Error de conexión con el servidor");
            return false;
        }
    }
};
