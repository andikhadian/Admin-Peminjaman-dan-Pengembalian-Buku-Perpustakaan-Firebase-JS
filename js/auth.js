let username = localStorage.getItem("username");
let name = localStorage.getItem("name");
let image = localStorage.getItem("image");

if (username) {
} else {
    //nendang ke login jika tidak ada local storage username
    location.href = 'login.html';
}

firebase.database().ref('Petugas/' + username).once('value').then(function (snapshot) {
    let password = (snapshot.val() && snapshot.val().password) || 'Tidak Ditemukan'

    if (password == 'petugaspp') {
        $('#alert-password-bawaan').removeClass('d-none');
    } else {
        $('#alert-password-bawaan').addClass('d-none');
    }
})



document.getElementById("displayUsername").innerHTML = username;

document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Sedang logout...');
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("password");
    localStorage.removeItem("image");
    console.log('Local Storage Berhasil di Reset');
    location.href = 'login.html'
})