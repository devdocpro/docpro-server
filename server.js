const express = require("express");
const isAuth = require("./middleware/authentication");
const bodyParser = require("body-parser");

const {
  signupDokter,
  loginDokter,
  updateDokter,
  deleteDokter,
  getDataDokter,
} = require("./server/api/dokter");
const {
  addPasien,
  updatePasien,
  deletePasien,
  getAllPasien,
  getDetailsPasien,
  searchPasien,
} = require("./server/api/pasien");
const {
  addNewService,
  deleteService,
  detailService,
  getServices,
  updateService,
  addNewDrug,
  getDrugs,
  detailDrug,
  deleteDrug,
  updateDrug,
} = require("./server/api/items");
const {
  appointment,
  newAppointment,
  deleteAppointment,
  filterAppointment,
  getSingleAppointment,
} = require("./server/api/appointment");
const { addNewDiagnosa } = require("./server/api/diagnosa");
const { getHitory } = require("./server/api/history");
const { addNewPhotoData, deletePhotoData } = require("./server/api/photo_data");

const {
  uploadPhotoDoctor,
  uploadPhotoPasien,
  uploadPhotoDataAppointment,
  uploadPhotoDataPasien,
} = require("./server/util/multer");

const app = express();
const PORT = process.env.PORT || 8000;

const setHeader = (req, res, next) => {
  res.setHeader("Content-type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
};

app.use(bodyParser.json());
app.use(setHeader);
app.use(isAuth);

app.get("", (req, res) => {
  return res.json({ message: "DocPro api version 1.0.0" });
});

const docProAPI = "/api/doc-pro/v1";

// Api untuk dokter ----------------------------------
app.get(`${docProAPI}/doctor`, getDataDokter);
app.post(`${docProAPI}/signup`, signupDokter);
app.post(`${docProAPI}/login`, loginDokter);
app.post(
  `${docProAPI}/doctor/update`,
  uploadPhotoDoctor.single("photoDoctor"),
  updateDokter
);
app.delete(`${docProAPI}/doctor`, deleteDokter);
// ----------------------------------------------------

// Api untuk user -------------------------------------
app.get(`${docProAPI}/pasien/search`, searchPasien);
app.get(`${docProAPI}/pasien/detail`, getDetailsPasien);
app.get(`${docProAPI}/pasien`, getAllPasien);
app.post(
  `${docProAPI}/pasien`,
  uploadPhotoPasien.single("photoPasien"),
  addPasien
);
app.post(
  `${docProAPI}/pasien/update`,
  uploadPhotoPasien.single("photoPasien"),
  updatePasien
);
app.delete(`${docProAPI}/pasien`, deletePasien);
// -----------------------------------------------------

// Api untuk item -----------------------------
app.get(`${docProAPI}/service/detail`, detailService);
app.get(`${docProAPI}/drug/detail`, detailDrug);
app.get(`${docProAPI}/service`, getServices);
app.get(`${docProAPI}/drug`, getDrugs);
app.post(`${docProAPI}/service/update`, updateService);
app.post(`${docProAPI}/service`, addNewService);
app.post(`${docProAPI}/drug/update`, updateDrug);
app.post(`${docProAPI}/drug`, addNewDrug);
app.delete(`${docProAPI}/service`, deleteService);
app.delete(`${docProAPI}/drug`, deleteDrug);
// ---------------------------------------------

// Api untuk appointment -------------------------------------
app.get(`${docProAPI}/appointment/filter`, filterAppointment);
app.get(`${docProAPI}/appointment/detail`, getSingleAppointment);
app.get(`${docProAPI}/appointment`, appointment);
app.post(
  `${docProAPI}/appointment`,
  uploadPhotoDataAppointment.single("photoData"),
  newAppointment
);
app.delete(`${docProAPI}/appointment`, deleteAppointment);
// -----------------------------------------------------------

// Api untuk diagnosa ----------------------------------------
app.post(`${docProAPI}/diagnosa`, addNewDiagnosa);
// -----------------------------------------------------------

// Api untuk history -----------------------------------------
app.get(`${docProAPI}/history`, getHitory);
// -----------------------------------------------------------

// Api untuk Photo data --------------------------------------
app.post(
  `${docProAPI}/photo`,
  uploadPhotoDataPasien.single("photoDataPasien"),
  addNewPhotoData
);
app.delete(`${docProAPI}/photo`, deletePhotoData);
// -----------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Port Running ON : http://localhost:${PORT}/`);
});
