const connection = require("../config/connection");
const knex = require("knex")(connection);
const moment = require("moment");

exports.getHitory = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  try {
    let newHistory = [];
    const history = await knex("history")
      .select("*")
      .where({ is_deleted: false })
      .orderBy("tanggal", "desc")
      .orderBy("jam", "desc");

    history.forEach((hstry) => {
      const formatDate = moment(hstry.tanggal).format("YYYY-MM-DD");

      let pasien = {
        id_pasien: hstry.id_pasien,
        nama: hstry.nama,
        nik: hstry.nik,
        tanggal_lahir: hstry.tanggal_lahir,
        alamat: hstry.alamat,
        phone: hstry.phone,
        photo: hstry.photo_pasien,
      };
      let appointmet = {
        id_appointment: hstry.id_appointment,
        keperluan: hstry.keperluan,
        tanggal: formatDate,
        jam: hstry.jam,
        keluhan: hstry.keluhan,
        is_checked: hstry.is_checked,
      };
      let diagnosa = {
        penanganan: hstry.penanganan,
        doctor: hstry.doctor,
        total_biaya: hstry.total_biaya,
      };
      newHistory.push({ pasien, appointmet, diagnosa });
    });

    return res.status(200).json(newHistory);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
