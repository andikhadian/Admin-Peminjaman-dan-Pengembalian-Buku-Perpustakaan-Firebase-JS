let date = new Date();
let t = date.getTime();
let counter = 'PEM' + t;

let row = 0;
let no = 1;
let pinjam = 1;
let total = 0;
let db = firebase.database();

// ! Tanggal HARI INI untuk Peminjaman
date.setDate(date.getDate());
let set_tgl_peminjaman = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
document.getElementById('tgl_peminjaman').value = set_tgl_peminjaman;

// ! Tanggal 7 HARI KEDEPAN untuk Pengembalian
date.setDate(date.getDate() + 7);
let set_tgl_pengembalian = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
document.getElementById('tgl_pengembalian').value = set_tgl_pengembalian;

// ! Menampilkan Anggota ke dalam Combobox
db.ref("Anggota/").on("child_added", function (data) {
    let Value = data.val();

    document.getElementById("id_anggota").innerHTML += `
    <option value="${Value.id}">${Value.id}</option>
    `;

    document.getElementById("id_anggota").onchange = function () {
        let id_anggota = this.value;

        db.ref('Anggota/' + id_anggota).once('value').then(function (snapshot) {
            var nama_anggota = (snapshot.val() && snapshot.val().nama) || 'Tidak Ditemukan';

            document.getElementById("nama_anggota").value = nama_anggota;
        })
    };
})

// ! Menampilkan Buku ke dalam Combobox
db.ref("Buku/").on("child_added", function (data) {
    let Value = data.val();

    document.getElementById("id_buku").innerHTML += `
    <option value="${Value.id}">${Value.id}</option>
    `;

    document.getElementById("id_buku").onchange = function () {
        let id_buku = this.value;

        db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
            var judul_buku = (snapshot.val() && snapshot.val().title) || 'Tidak Ditemukan'
            var stok = (snapshot.val() && snapshot.val().stok) || 'Tidak Ditemukan'

            document.getElementById("judul_buku").value = judul_buku;
            document.getElementById("stok").value = stok;
        })
    };
})

// ! Memasukan Buku ke dalam keranjang
document.getElementById('btn-keranjang').addEventListener('click', (e) => {

    if (pinjam > 3) {
        alert('Maksimal meminjam adalah 3 kali ');
    } else {
        lihatKeranjang();
        document.getElementById('id_buku').value = '';
        document.getElementById('judul_buku').value = '';
        document.getElementById('stok').value = '';
        document.getElementById('jumlah_pinjam').value = '';
        pinjam++;
    }
});

// ! Create Peminjaman
document.getElementById('btn-pinjam').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-pinjam').disabled = true;
    document.getElementById('btn-pinjam').innerHTML = 'Menambah peminjaman...';
    let id_anggota = document.getElementById('id_anggota').value;
    let tgl_peminjaman = document.getElementById('tgl_peminjaman').value;
    let tgl_pengembalian = document.getElementById('tgl_pengembalian').value;

    let data = {
        id: counter,
        id_anggota: id_anggota,
        tgl_peminjaman: tgl_peminjaman,
        tgl_pengembalian: tgl_pengembalian,
        status: 'Belum Dikembalikan',
        username: localStorage.getItem('username'),
    }

    db.ref("Peminjaman/" + counter).update(data);
    document.getElementById('btn-pinjam').disabled = false;
    document.getElementById('btn-pinjam').innerHTML = 'Tambah Peminjaman';
    window.alert('Tambah Peminjaman Berhasil !');
    counter += 1;
    $('#modalTambahPeminjaman').modal('hide')
    document.getElementById("cardSection").innerHTML = '';

    readPeminjaman();
});

// ! Create Peminjaman dan Cetak Struk
document.getElementById('btn-pinjam-struk').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-pinjam').disabled = true;
    document.getElementById('btn-pinjam').innerHTML = 'Menambah peminjaman...';
    let id_anggota = document.getElementById('id_anggota').value;
    let tgl_peminjaman = document.getElementById('tgl_peminjaman').value;
    let tgl_pengembalian = document.getElementById('tgl_pengembalian').value;

    let data = {
        id: counter,
        id_anggota: id_anggota,
        tgl_peminjaman: tgl_peminjaman,
        tgl_pengembalian: tgl_pengembalian,
        status: 'Belum Dikembalikan',
        username: localStorage.getItem('username'),
    }

    db.ref("Peminjaman/" + counter).update(data);
    document.getElementById('btn-pinjam').disabled = false;
    document.getElementById('btn-pinjam').innerHTML = 'Tambah Peminjaman';
    window.alert('Tambah Peminjaman Berhasil !');

    printStruk(counter);
    counter += 1;
    $('#modalTambahPeminjaman').modal('hide')
    document.getElementById("cardSection").innerHTML = '';

    readPeminjaman();
});

// ! Menampilkan Buku ke dalam keranjang
function lihatKeranjang() {
    let id_buku = document.getElementById('id_buku').value;
    let jumlah_pinjam = document.getElementById('jumlah_pinjam').value;

    if (!id_buku || !jumlah_pinjam) {
        alert('Silahkan lengkapi ID Buku dan Jumlah Pinjam')
        return;
    }

    let data_buku = {
        id: id_buku,
        jumlah_pinjam: jumlah_pinjam
    }

    db.ref("Peminjaman/" + counter + "/pinjam/" + id_buku).update(data_buku);

    db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
        var stok = (snapshot.val() && snapshot.val().stok) || 'Tidak Ditemukan'
        let hasil_stok = stok - jumlah_pinjam;
        let data_stok = {
            stok: hasil_stok.toString(),
        }

        db.ref('Buku/' + id_buku).update(data_stok);
    })

    db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
        var judul_buku = (snapshot.val() && snapshot.val().title) || 'Tidak Ditemukan'
        $('#table-title').removeClass('d-none');
        document.getElementById('table-keranjang').innerHTML += `
        <tr id="${no}">
            <td class="align-middle">${id_buku}</td>
            <td class="align-middle">${judul_buku}</td>
            <td class="align-middle">${jumlah_pinjam}</td>
            <td class="align-middle"><button type="button" class="btn btn-danger" onclick="deleteKeranjang('${no}','${counter}','${id_buku}','${jumlah_pinjam}')">Hapus</td>
        </tr>
        `;
        no++;
    })
}

// ! Menghapus Buku dari keranjang
function deleteKeranjang(index, id, id_buku, jumlah_pinjam) {
    table = document.getElementById("table-keranjang");
    row = document.getElementById(index);
    table.removeChild(row);

    db.ref("Peminjaman/" + id + "/pinjam/" + id_buku).remove();
    db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
        var stok = (snapshot.val() && snapshot.val().stok) || 'Tidak Ditemukan'
        let hasil_stok = parseInt(stok) + parseInt(jumlah_pinjam);

        let data_stok = {
            stok: hasil_stok.toString(),
        }

        db.ref('Buku/' + id_buku).update(data_stok);
    });
    pinjam--;
}


// ! Filter Peminjaman
document.getElementById('filter').addEventListener('click', (e) => {
    let filter = document.getElementById('urutkan').value;
    document.getElementById("cardSection").innerHTML = '';

    readPeminjaman(filter);
})

// ! Read Peminjaman
function readPeminjaman(filter = 'tgl_peminjaman') {
    let db = firebase.database().ref("Peminjaman/").orderByChild(filter);
    db.on("child_added", function (data) {
        let Value = data.val();

        let jumlah_pinjam = Object.keys(Value.pinjam).length;
        let badge = '';
        if (Value.status == 'Belum Dikembalikan') {
            badge = 'badge-warning';
        } else {
            badge = 'badge-success';
        }

        document.getElementById("cardSection").innerHTML += `
        <div class="row">
            <div class="col-md-12 mb-3">
                <div class="card">
                    <div class="card-header">
                    ${Value.id}
                        <div class="float-right">
                        </div>
                    </div>
                    <div class="card-body">
                        <table class="table table-bordered">
                            <tr>
                                <td style="width: 30%;">Status</td>
                                <td><span class="badge ${badge} text-light p-2">${Value.status}</span></td>
                            </tr>
                            <tr>
                                <td style="width: 30%;">ID Anggota</td>
                                <td>${Value.id_anggota}</td>
                            </tr>
                            <tr>
                                <td style="width: 30%;">Meminjam</td>
                                <td>${jumlah_pinjam} Eksemplar</td>
                            </tr>
                            <tr>
                                <td style="width: 30%;">Tanggal Peminjaman</td>
                                <td>${Value.tgl_peminjaman}</td>
                            </tr>
                            <tr>
                                <td style="width: 30%;">Tanggal Pengembalian</td>
                                <td>${Value.tgl_pengembalian}</td>
                            </tr>
                            <tr>
                                <td style="width: 30%;">Penanggung Jawab</td>
                                <td>${Value.username}</td>
                            </tr>
                        </table>
                        <button type="button" class="btn btn-danger" onclick="printStruk('${Value.id}')">Cetak Struk</button>
                        <button type="button" class="btn btn-info" data-toggle="modal"
                        data-target="#modalDetailPeminjaman" onclick="showPeminjaman('${Value.id}')">Lihat Detail</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
}

function showPeminjaman(id_peminjaman) {
    document.getElementById('table-daftar-buku').innerHTML = ''
    total = 0

    db.ref('Peminjaman/' + id_peminjaman).once('value').then(function (snapshot) {
        var id = (snapshot.val() && snapshot.val().id) || 'Tidak Ditemukan'
        var status = (snapshot.val() && snapshot.val().status) || 'Tidak Ditemukan'
        var username = (snapshot.val() && snapshot.val().username) || 'Tidak Ditemukan'
        var tgl_peminjaman = (snapshot.val() && snapshot.val().tgl_peminjaman) || 'Tidak Ditemukan'
        var tgl_pengembalian = (snapshot.val() && snapshot.val().tgl_pengembalian) || 'Tidak Ditemukan'
        var id_anggota = (snapshot.val() && snapshot.val().id_anggota) || 'Tidak Ditemukan'

        document.getElementById('tampil-id-peminjaman').value = id;
        document.getElementById('tampil-status').value = status;
        document.getElementById('tampil-username').value = username;
        document.getElementById('tampil-tgl-peminjaman').value = tgl_peminjaman;
        document.getElementById('tampil-tgl-pengembalian').value = tgl_pengembalian;
        document.getElementById('tampil-id-anggota').value = id_anggota;

        db.ref('Anggota/' + id_anggota).once('value').then(function (snapshot) {
            var nama = (snapshot.val() && snapshot.val().nama) || 'Tidak Ditemukan'
            var kelas = (snapshot.val() && snapshot.val().kelas) || 'Tidak Ditemukan'
            var no_hp = (snapshot.val() && snapshot.val().no_hp) || 'Tidak Ditemukan'
            var email = (snapshot.val() && snapshot.val().email) || 'Tidak Ditemukan'

            document.getElementById('tampil-nama-anggota').value = nama;
            document.getElementById('tampil-kelas-anggota').value = kelas;
            document.getElementById('tampil-no-hp-anggota').value = no_hp;
            document.getElementById('tampil-email-anggota').value = email;
        })
    })

    db.ref("Peminjaman/" + id_peminjaman + '/pinjam').on("child_added", function (data) {
        let Value = data.val();
        let id_buku = Value.id;

        let jumlah_pinjam = parseInt(Value.jumlah_pinjam);

        db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
            var id_buku = (snapshot.val() && snapshot.val().id) || 'Tidak Ditemukan'
            var title = (snapshot.val() && snapshot.val().title) || 'Tidak Ditemukan'
            var image = (snapshot.val() && snapshot.val().image) || 'Tidak Ditemukan'

            document.getElementById('table-daftar-buku').innerHTML += `
            <tr>
                <td><img src="${image}" style="width:100px;height:130px" class="img-thumbnail"></td>
                <td class="align-middle">${id_buku}</td>
                <td class="align-middle">${title}</td>
                <td class="align-middle text-right">${jumlah_pinjam}</td>
            </tr>
            `;

        })
        total = total + jumlah_pinjam;
    })
    document.getElementById('total-buku').innerHTML = total
}

// ! Report Struk
function printStruk(id_peminjaman) {
    let no_buku = 1;
    document.getElementById('table-daftar-struk-buku').innerHTML = ''
    db.ref("Peminjaman/" + id_peminjaman + '/pinjam').on("child_added", function (data) {
        let Value = data.val();
        let id_buku = Value.id;

        let jumlah_pinjam = parseInt(Value.jumlah_pinjam);

        db.ref('Buku/' + id_buku).once('value').then(function (snapshot) {
            var id_buku = (snapshot.val() && snapshot.val().id) || 'Tidak Ditemukan'
            var title = (snapshot.val() && snapshot.val().title) || 'Tidak Ditemukan'

            document.getElementById('table-daftar-struk-buku').innerHTML += `
            <tr>
                <td>${no_buku++}</td>
                <td>${id_buku}</td>
                <td>${title}</td>
                <td>${jumlah_pinjam}</td>
            </tr>
            `;
        })
    })


    db.ref('Peminjaman/' + id_peminjaman).once('value').then(function (snapshot) {
        let id = (snapshot.val() && snapshot.val().id) || 'Tidak Ditemukan'
        let username = (snapshot.val() && snapshot.val().username) || 'Tidak Ditemukan'
        let id_anggota = (snapshot.val() && snapshot.val().id_anggota) || 'Tidak Ditemukan'
        let status = (snapshot.val() && snapshot.val().status) || 'Tidak Ditemukan'
        let tgl_peminjaman = (snapshot.val() && snapshot.val().tgl_peminjaman) || 'Tidak Ditemukan'
        let tgl_pengembalian = (snapshot.val() && snapshot.val().tgl_pengembalian) || 'Tidak Ditemukan'
        let jumlah_pinjam = Object.keys(snapshot.val().pinjam).length;

        document.getElementById('struk-id-peminjaman').innerHTML = id;
        document.getElementById('struk-username').innerHTML = username;
        document.getElementById('struk-id-anggota').innerHTML = id_anggota;
        document.getElementById('struk-pinjam').innerHTML = jumlah_pinjam + ' Eksemplar';
        document.getElementById('struk-status').innerHTML = status;
        document.getElementById('struk-tgl-peminjaman').innerHTML = tgl_peminjaman;
        document.getElementById('struk-tgl-pengembalian').innerHTML = tgl_pengembalian;

        db.ref('Anggota/' + id_anggota).once('value').then(function (snapshot) {
            let nama = (snapshot.val() && snapshot.val().nama) || 'Tidak Ditemukan'

            document.getElementById('struk-nama-anggota').innerHTML = nama;

            var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });

            doc.setFontSize(14);
            doc.text("Struk Peminjaman Buku", 103, 20, null, null, "center");

            // var elem = document.getElementById("my-table");
            // var res = doc.autoTableHtmlToJson(elem);
            doc.autoTable({ html: '#table-struk', margin: { top: 30 }, });

            // var elem = document.getElementById("table-daftar-struk-buku");
            // var res = doc.autoTableHtmlToJson(elem);
            doc.autoTable({ html: '#table-daftar-pinjam', margin: { top: 30 }, });

            doc.setFontSize(10);
            doc.text("Jakarta, " + dateNow(), 170, 150, null, null, "center");
            doc.text(localStorage.getItem('username'), 170, 190, null, null, "center");
            doc.text("(Petugas Perpustakaan)", 170, 195, null, null, "center");


            window.open(URL.createObjectURL(doc.output("blob")))
        })
    })
}

// ! Report Peminjaman
function print() {
    let db = firebase.database().ref("Peminjaman/");

    db.once('value', function (snapshot) {
        if (snapshot.exists()) {
            var content = '';

            snapshot.forEach(function (data) {
                var id = data.val().id;
                var id_anggota = data.val().id_anggota;
                var pinjam = Object.keys(data.val().pinjam).length;
                var tgl_peminjaman = data.val().tgl_peminjaman;
                var tgl_pengembalian = data.val().tgl_pengembalian;
                var status = data.val().status;
                content += '<tr>';
                content += '<td>' + id + '</td>'; //column1
                content += '<td>' + id_anggota + '</td>';//column2
                content += '<td>' + pinjam + '</td>';//column2
                content += '<td>' + tgl_peminjaman + '</td>';//column2
                content += '<td>' + tgl_pengembalian + '</td>';//column2
                content += '<td>' + status + '</td>';//column2
                content += '</tr>';
            });

            $('#my-table').append(content);
        }
    });

    var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
    var url = 'data:image/png;base64,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';
    doc.addImage(url, "PNG", 5, 7, 30, 30);
    doc.addImage(url, "PNG", 175, 7, 30, 30);

    doc.setFontSize(12);
    doc.text("SEKOLAH MENENGAH KEJURUAN (SMK)", 103, 10, null, null, "center");
    doc.text("PRESTASI PRIMA", 103, 15, null, null, "center");
    doc.setFontSize(8);
    doc.text("Bidang Studi Keahlian : Teknologi Informasi dan Komunikasi", 103, 20, null, null, "center");
    doc.text("Program Studi : TEKNIK KOMPUTER DAN INFORMATIKA DAN BROADCASTING", 103, 24, null, null, "center");
    doc.text("Jalan Hankam Raya RT.007/RW.04 No 89, Cilangkap, Cipayung", 103, 28, null, null, "center");
    doc.text("Jakarta Timur. Telp. 021-84306823, Kode Pos. 13870", 103, 32, null, null, "center");
    doc.text("Web : www.smkprestasiprima.sch.id, E-mail : sekolah@smkprestasiprima.sch.id", 103, 36, null, null, "center");

    doc.setLineWidth(0.5);
    doc.line(5, 40, 205, 40);

    doc.setFontSize(14);
    doc.text("Laporan Peminjaman Buku", 103, 50, null, null, "center");

    var elem = document.getElementById("my-table");
    var res = doc.autoTableHtmlToJson(elem);
    doc.autoTable({ html: '#my-table', margin: { top: 60 }, });

    doc.setFontSize(10);
    doc.text("Jakarta, " + dateNow(), 170, 220, null, null, "center");
    doc.text("Daud Martupa Sitinjak", 170, 260, null, null, "center");
    doc.text("(Wakil Kesiswaan)", 170, 265, null, null, "center");

    window.open(URL.createObjectURL(doc.output("blob")))
}


// ! Ambil waktu sekarang
function dateNow() {
    var date = new Date();
    var tahun = date.getFullYear();
    var bulan = date.getMonth();
    var tanggal = date.getDate();
    var hari = date.getDay();
    var jam = date.getHours();
    var menit = date.getMinutes();
    var detik = date.getSeconds();

    switch (hari) {
        case 0: hari = "Minggu"; break;
        case 1: hari = "Senin"; break;
        case 2: hari = "Selasa"; break;
        case 3: hari = "Rabu"; break;
        case 4: hari = "Kamis"; break;
        case 5: hari = "Jum'at"; break;
        case 6: hari = "Sabtu"; break;
    }

    switch (bulan) {
        case 0: bulan = "Januari"; break;
        case 1: bulan = "Februari"; break;
        case 2: bulan = "Maret"; break;
        case 3: bulan = "April"; break;
        case 4: bulan = "Mei"; break;
        case 5: bulan = "Juni"; break;
        case 6: bulan = "Juli"; break;
        case 7: bulan = "Agustus"; break;
        case 8: bulan = "September"; break;
        case 9: bulan = "Oktober"; break;
        case 10: bulan = "November"; break;
        case 11: bulan = "Desember"; break;
    }

    var tampilTanggal = "" + hari + " " + tanggal + " " + bulan + " " + tahun;
    return tampilTanggal;

}