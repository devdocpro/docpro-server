const connection = require("../config/connection");
const knex = require("knex")(connection);
const { validateDiagnosa } = require("../validation/isValid");
const moment = require("moment");

exports.addNewDiagnosa = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_doctor = req.id_doctor;
  const today = moment(Date.now()).format("YYYY-MM-DD");

  let data = {
    id_appointment: req.body.id_appointment,
    penanganan: req.body.penanganan,
    total_biaya: req.body.total_biaya,
  };

  const { valid, errors } = validateDiagnosa(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findAppointment = await knex("appointment").where({
      id_appointment: data.id_appointment,
    });
    if (findAppointment.length === 0)
      return res.status(404).json({ message: "Appointment is not found" });

    const filterDiagnosa = await knex("diagnosa").where({
      id_appointment: data.id_appointment,
    });
    if (filterDiagnosa.length > 0)
      return res.status(400).json({ message: "Appointment sudah di diagnosa" });

    const findDoctor = await knex("doctor").where({ id_doctor });
    data.doctor = findDoctor[0].nama;

    const diagnosa = await knex("diagnosa").insert(data);
    const id_diagnosa = diagnosa;
    const id_appointment = await knex("diagnosa").where({ id_diagnosa });

    await knex("appointment")
      .where("id_appointment", id_appointment[0].id_appointment)
      .update({ is_checked: true });

    const findPhoto = await knex("photo_data").where(
      "id_appointment",
      id_appointment[0].id_appointment
    );

    if (findPhoto.length > 0) {
      await knex("photo_data")
        .where("id_appointment", id_appointment[0].id_appointment)
        .update({ is_checked: true, added_on: today });
    }

    return res.status(200).json({ message: "Diagnosa is avalaible" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
