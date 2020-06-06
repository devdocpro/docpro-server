const bcrypt = require("bcryptjs");
const {
  validateSignupDokter,
  validateLoginDokter,
  validateUpdateDokter,
} = require("../validation/isValid");

const connection = require("../config/connection");
const knex = require("knex")(connection);
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const moment = require("moment");

exports.signupDokter = async (req, res) => {
  let encryptPassword;

  const today = moment(Date.now()).format("YYYY-MM-DD");

  let signupData = {
    nama: req.body.nama,
    npa: req.body.npa,
    alamat: req.body.alamat,
    username: req.body.username,
    password: req.body.password,
    phone: req.body.phone,
    email: req.body.email,
    tanggal_lahir: req.body.tanggal_lahir,
    added_on: today,
    is_deleted: false,
    photo: "Default_Image.png",
  };

  const { valid, errors } = validateSignupDokter(signupData);
  if (!valid) return res.status(400).json(errors);

  try {
    encryptPassword = await bcrypt.hash(req.body.password, 12);
    signupData.password = encryptPassword;

    const searchDokter = await knex("doctor").where({
      username: signupData.username,
      is_deleted: false,
    });
    if (searchDokter.length > 0)
      return res.status(400).json({ message: "username sudah ada" });

    const insertDokter = await knex("doctor").insert(signupData);
    const id_dokter = insertDokter;

    const dokter = await knex("doctor").where({ id_doctor: id_dokter });
    let data = dokter[0];
    const token = jwt.sign(
      {
        id_doctor: data.id_doctor,
      },
      "docprosupersecretkey",
      { expiresIn: "20h" }
    );

    return res.status(200).json({ id_doctor: data.id_doctor, token });
  } catch (err) {
    console.log(err);

    return res
      .status(400)
      .json({ message: "Something went wrong!", error: err });
  }
};

// Untuk Login Dokter
exports.loginDokter = async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
  };
  const { valid, errors } = validateLoginDokter(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findDokter = await knex("doctor").where({
      username: data.username,
      is_deleted: false,
    });

    if (findDokter.length === 0)
      return res.status(404).json({ message: "Doctor not found" });
    let dokter = findDokter[0];

    const decryptPassword = await bcrypt.compare(
      data.password,
      dokter.password
    );
    if (!decryptPassword)
      return res.status(400).json({ message: "Password tidak sama" });

    const token = jwt.sign(
      { id_doctor: dokter.id_doctor },
      "docprosupersecretkey",
      { expiresIn: "24h" }
    );

    return res.status(200).json({ id_doctor: dokter.id_doctor, token });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
};

exports.updateDokter = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_doctor = req.id_doctor;

  let data = {
    nama: req.body.nama,
    npa: req.body.npa,
    alamat: req.body.alamat,
    phone: req.body.phone,
    email: req.body.email,
    tanggal_lahir: req.body.tanggal_lahir,
  };

  const { valid, errors } = validateUpdateDokter(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findDokter = await knex("doctor").where({ id_doctor });
    const doctor = findDokter[0];
    let oldProfilePicture = doctor.photo;
    if (!req.file) {
      await knex("doctor").update(data).where({ id_doctor });
      return res.status(200).json({ message: "Data berhasil dirubah" });
    }
    const newPhoto = req.file.filename;
    data.photo = newPhoto;
    await knex("doctor").update(data).where({ id_doctor });

    const findPhotoDocter = await knex("doctor")
      .where({ id_doctor })
      .select("photo");

    const photo = findPhotoDocter[0].photo;

    if (oldProfilePicture === "Default_Image.png") {
      return res.status(200).json({ message: "Doctor is up to date" });
    } else if (oldProfilePicture === photo) {
      return res
        .status(200)
        .json({ message: "Doctor is up to date and photo is not changed" });
    } else if (oldProfilePicture !== photo) {
      const dirPath = path.join(
        __dirname,
        "../../../docpro/public/images/doctor/"
      );

      fs.unlink(dirPath + oldProfilePicture, (err) => {
        if (err && err.code == "ENOENT") {
          return res.status(404).json({ message: "File doens't exist" });
          // file doens't exist
          console.info("File doesn't exist, won't remove it.");
        } else if (err) {
          // other errors, e.g. maybe we don't have enough permission
          console.error("Error occurred while trying to remove file");
        } else {
          return res
            .status(200)
            .json({ message: "Doctor is up to date and photo is changed" });
        }
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deleteDokter = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_doctor_auth = req.id_doctor;
  const id_doctor = req.query.id;

  try {
    const findDoctor = await knex("doctor").where({ id_doctor });
    if (findDoctor.length === 0)
      return res.status(404).json({ message: "Doctor not found" });

    if (id_doctor === id_doctor_auth.toString())
      return res.status(400).json({ message: "Cant delete your own account" });

    await knex("doctor").where({ id_doctor }).update({ is_deleted: true });
    return res.status(200).json({ message: "Doctor is deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getDataDokter = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_doctor = req.id_doctor;

  try {
    let dokter = await knex("doctor").where({ id_doctor, is_deleted: false });
    const formatDate = moment(dokter[0].added_on).format("YYYY-MM-DD");
    dokter[0].added_on = formatDate;
    const detailDokter = dokter[0];

    return res.status(200).json(detailDokter);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
