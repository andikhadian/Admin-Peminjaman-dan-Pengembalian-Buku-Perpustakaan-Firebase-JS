// ! Form Tambah Petugas
document.getElementById("form-login").addEventListener("submit", (e) => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    e.preventDefault();
    if (username) {
        if (password) {
            login(username, password);
        } else {
            window.alert('Password tidak boleh kosong');
        }
    } else {
        window.alert('Username tidak boleh kosong');
    }
})

function login(userInput, passwordInput) {
    document.getElementById('button-login').disabled = true;
    document.getElementById('button-login').innerHTML = 'Sedang login...';
    return firebase.database().ref('Petugas/' + userInput).once('value').then(function (snapshot) {
        var userId = (snapshot.val() && snapshot.val().id) || 'Tidak Ditemukan'
        var userDb = (snapshot.val() && snapshot.val().username) || 'Tidak Ditemukan'
        var nameDb = (snapshot.val() && snapshot.val().nama)
        var passwordDb = (snapshot.val() && snapshot.val().password)
        var imageDb = (snapshot.val() && snapshot.val().image)

        if (userDb != 'Tidak Ditemukan') {
            console.log('Akun Ditemukan');
            if (passwordDb == passwordInput) {
                console.log('Selamat Datang ' + userDb);
                window.alert('Selamat Datang ' + userDb);

                localStorage.setItem("id", userId);
                localStorage.setItem("username", userDb);
                localStorage.setItem("name", nameDb);
                localStorage.setItem("image", imageDb);
                console.log('Storage berhasil ditambahkan');

                location.href = 'home.html';
            } else {
                console.log('Password Salah ');
                window.alert('Password anda salah');

                document.getElementById('button-login').disabled = false;
                document.getElementById('button-login').innerHTML = 'Login';
            }
        } else {
            console.log('Akun Tidak Ditemukan ');
            window.alert('Akun Tidak Ditemukan');
            document.getElementById('button-login').disabled = false;
            document.getElementById('button-login').innerHTML = 'Login';
        }
    });
}