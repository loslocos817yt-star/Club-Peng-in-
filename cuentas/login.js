const AuthSystem = {
    token: "", // Tu sistema de obtención de token aquí
    repo: "loslocos817yt-star/Club-Peng-in-",
    path: "cuentas/usuarios/cuentas.json",
    db: [],
    sha: "",

    async inicializar() {
        try {
            // Aquí puedes meter tu lógica para cargar el token si lo necesitas
            const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}`);
            const data = await res.json();
            this.sha = data.sha;
            this.db = JSON.parse(atob(data.content));
        } catch (e) {
            console.log("Error al cargar DB");
        }
    },

    async hashPass(str) {
        const utf8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async autenticar(nombre, pass, isRegister) {
        const hash = await this.hashPass(pass);
        let user = this.db.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());

        if (isRegister) {
            if (user) {
                document.getElementById('status').innerText = "Ese nombre ya existe";
                return null;
            }
            user = { nombre, pass: hash, monedas: 500, posicion: { x: 450, y: 350 }, items: [] };
            this.db.push(user);
            await this.guardarEnGitHub(`Nuevo usuario: ${nombre}`);
            return user;
        } else {
            if (!user || user.pass !== hash) {
                document.getElementById('status').innerText = "Usuario o clave incorrectos";
                return null;
            }
            return user;
        }
    },

    async guardarEnGitHub(mensaje) {
        // RECUERDA: GitHub requiere Token para el método PUT
        const url = `https://api.github.com/repos/${this.repo}/contents/${this.path}`;
        const body = {
            message: mensaje,
            content: btoa(JSON.stringify(this.db, null, 2)),
            sha: this.sha
        };

        await fetch(url, {
            method: "PUT",
            headers: { 
                "Authorization": `token ${this.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }
};
