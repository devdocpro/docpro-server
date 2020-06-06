const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const connection = require("../config/connection");
const knex = require("knex")(connection);

const {
  validateUpdateDokter,
  validatePasien,
  validateAppointment,
} = require("../validation/isValid");

const date = new Date();
const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const tanggal = date.getDate();
const bulan = months[date.getMonth()];
const tahun = date.getFullYear();
const fullTanggal = `${tahun}${bulan}${tanggal}`;

const multerFileFilterDokter = (req, file, callback) => {
  if (!req.isAuth) return callback(null, false);

  const { valid } = validateUpdateDokter(req.body);

  if (valid) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback("Only accept image files", false);
    }
  } else {
    callback(null, false);
  }
};

const multerFileFilterPasien = async (req, file, callback) => {
  if (!req.isAuth) return callback(null, false);
  const id_pasien = req.query.id;

  const { valid } = validatePasien(req.body);

  if (valid) {
    if (id_pasien !== undefined) {
      const findUser = await knex("pasien").where({
        id_pasien,
        is_deleted: false,
      });
      if (findUser.length === 0) return callback(null, false);
    } else {
      const nik = await knex("pasien").where({ nik: req.body.nik });
      if (nik.length > 0) return callback(null, false);
    }

    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback("Only accept image files", false);
    }
  } else {
    callback(null, false);
  }
};

const multerFileFilterData = async (req, file, callback) => {
  if (!req.isAuth) return callback(null, false);

  const { valid } = validateAppointment(req.body);

  const date = req.body.tanggal;
  const newDate = date.split("/").reverse().join("-");

  if (valid) {
    const searchPasien = await knex("pasien").where({
      id_pasien: req.body.id_pasien,
      is_deleted: false,
    });
    if (searchPasien.length === 0) return callback(null, false);

    const filterByDate = await knex("appointment").where({
      tanggal: newDate,
      jam: req.body.jam,
    });
    if (filterByDate.length > 0) return callback(null, false);

    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback("Only accept image files", false);
    }
  } else {
    callback(null, false);
  }
};

const multerFileFilterPhotoData = async (req, file, callback) => {
  if (!req.isAuth) return callback(null, false);

  const searchPasien = await knex("pasien").where({
    id_pasien: req.body.id_pasien,
    is_deleted: false,
  });
  if (searchPasien.length === 0) return callback(null, false);

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback("Only accept image files", false);
  }
};

const storagePhotoDoctor = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    callback(null, "../../../docpro/public/images/doctor");
  },
  filename: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    const randomString = crypto.randomBytes(4).toString("hex");
    const extension = file.originalname.slice(
      ((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2
    );
    callback(
      null,
      `${req.id_doctor}-${fullTanggal}-` + `${randomString}.${extension}`
    );
  },
});

const storagePhotoPasien = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    callback(null, ".//docpro/public/images/pasien");
  },
  filename: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    const randomString = crypto.randomBytes(6).toString("hex");
    const extension = file.originalname.slice(
      ((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2
    );
    callback(null, `${fullTanggal}-` + `${randomString}.${extension}`);
  },
});

const storagePhotoData = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    callback(null, ".//docpro/public/images/data");
  },
  filename: (req, file, callback) => {
    if (!req.isAuth) return callback("Unauthorization");
    const randomString = crypto.randomBytes(6).toString("hex");
    const extension = file.originalname.slice(
      ((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2
    );
    callback(null, `${fullTanggal}-` + `${randomString}.${extension}`);
  },
});

exports.uploadPhotoDoctor = multer({
  storage: storagePhotoDoctor,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: multerFileFilterDokter,
});

exports.uploadPhotoPasien = multer({
  storage: storagePhotoPasien,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: multerFileFilterPasien,
});

exports.uploadPhotoDataAppointment = multer({
  storage: storagePhotoData,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: multerFileFilterData,
});

exports.uploadPhotoDataPasien = multer({
  storage: storagePhotoData,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: multerFileFilterPhotoData,
});
