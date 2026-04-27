const AuthSystem = {
    token: "",
    repo: "loslocos817yt-star/Club-Peng-in-",
    path: "cuentas/usuarios/usuarios.json",
    usuarioActual: null,
    db: [],
    sha: "",

    async inicializar() {
        try {
            const res = await fetch('cuentas/api.hash');
            if (!res.ok) throw new Error("No se encontró api.hash");
            const binario = await res.text();
            
            // TRADUCTOR: De Binario (0101) a Texto (ghp_...)
            this.token = binario.trim().match(/.{1,8}/g).map(byte => 
                String.fromCharCode(parseInt(byte, 2))
            ).join("");

            console.log("--- Sistema Ofuscado Listo ---");
        } catch (e) {
            console.error("Error al reconstruir el token:", e);
        }
    },

    async login() {
        const nombre = prompt("¿Cómo se llama tu Pingüino?");
        if (!nombre) return null;

        const url = `https://api.github.com/repos/${this.repo}/contents/${this.path}`;
        
        try {
            const res = await fetch(url, {
                headers: { "Authorization": `token ${this.token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                this.sha = data.sha;
                this.db = JSON.parse(atob(data.content));

                let user = this.db.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());

                if (!user) {
                    user = { 
                        nombre: nombre, 
                        monedas: 500, 
                        posicion: { x: 450, y: 350 },
                        items: [] 
                    };
                    this.db.push(user);
                    await this.guardarEnGitHub(`Nuevo pingüino: ${nombre}`);
                }
                this.usuarioActual = user;
                return user;
            }
        } catch (e) {
            console.error("Error en login:", e);
            return null;
        }
    },

    async guardarEnGitHub(mensaje = "Sincronización") {
        if (!this.token) return;
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
            this.sha = resData.content.sha;
            console.log("Datos guardados en el Repo.");
        }
    }
};
