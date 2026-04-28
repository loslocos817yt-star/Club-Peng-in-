const AuthSystem = {
    token: "",
    repo: "loslocos817yt-star/Club-Peng-in-",
    path: "cuentas/usuarios/cuentas.json",
    db: [],
    sha: "",

    async inicializar() {
        try {
            // Sacar el token del binario como ya lo hacías
            const resHash = await fetch('cuentas/api.hash');
            const binario = await resHash.text();
            this.token = binario.trim().match(/.{1,8}/g).map(byte => 
                String.fromCharCode(parseInt(byte, 2))
            ).join("");

            // Cargar la base de datos y el SHA actual
            const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}`, {
                headers: { "Authorization": `token ${this.token}` }
            });
            const data = await res.json();
            this.sha = data.sha;
            this.db = JSON.parse(atob(data.content));
            console.log("Sistema listo - DB cargada");
        } catch (e) {
            console.error("Error inicializando:", e);
        }
    },

    async autenticar(nombre, pass, isRegister) {
        let user = this.db.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());

        if (isRegister) {
            if (user) {
                alert("Ese nombre ya lo ganaron");
                return null;
            }
            // Registro directo, clave plana
            user = { 
                nombre: nombre, 
                pass: pass, 
                monedas: 500, 
                posicion: { x: 450, y: 350 }, 
                items: [] 
            };
            this.db.push(user);
            await this.guardarEnGitHub(`Nuevo usuario: ${nombre}`);
            return user;
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
            content: btoa(JSON.stringify(this.db, null, 2)),
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
            this.sha = resData.content.sha; // Importante: actualiza el SHA para el que sigue
            console.log("Usuario guardado en el JSON.");
        } else {
            console.error("No se pudo subir a GitHub");
        }
    }
};
