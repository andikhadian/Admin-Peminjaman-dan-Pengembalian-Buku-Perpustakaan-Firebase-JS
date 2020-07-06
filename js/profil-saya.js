document.getElementById('displayProfileName').innerHTML = name;
document.getElementById('displayProfileUsername').innerHTML = username;
document.getElementById('displayProfileImage').src = image;

document.getElementById('form-ubah-password').addEventListener('submit', (e) => {
    e.preventDefault();

    let password_lama = document.getElementById('password_lama').value;
    let password_baru = document.getElementById('password_baru').value;
    let konfirmasi_password = document.getElementById('konfirmasi_password').value;
    let username = localStorage.getItem('username');
    firebase.database().ref('Petugas/' + username).once('value').then(function (snapshot) {
        let usernameDb = (snapshot.val() && snapshot.val().username) || 'Tidak Ditemukan'
        let nama = (snapshot.val() && snapshot.val().nama) || 'Tidak Ditemukan'
        let userPassword = (snapshot.val() && snapshot.val().password) || 'Tidak Ditemukan'
        if (userPassword == password_lama) {
            // Password lama sama
            if (password_baru == konfirmasi_password) {
                let data_password_baru = {
                    password: password_baru
                }

                let db = firebase.database().ref("Petugas/" + usernameDb);
                db.update(data_password_baru);
                alert('Password berhasil diperbaharui');
            } else {
                alert('konfirmasi password tidak sama');
            }
        } else {
            // Password lama tidak sama
            alert('password lama tidak sama');
        }
    })
})