const connection = require("../config/connection");
const knex = require("knex")(connection);

const { validateDrug, validateService } = require("../validation/isValid");

// Item Service --------------------------------------------------------------
exports.addNewService = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  const data = {
    service_name: req.body.service_name,
    service_desc: req.body.service_desc,
    service_price: req.body.service_price,
  };

  const { valid, errors } = validateService(data);
  if (!valid) return res.status(400).json(errors);

  try {
    await knex("services").insert(data);
    return res.status(200).json({ message: "Service is added" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deleteService = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_service = req.query.id;
  try {
    const findItem = await knex("services").where({ id_service });
    if (findItem.length === 0)
      return res.status(404).json({ message: "Service is not found" });

    await knex("services").where({ id_service }).del();
    return res.status(200).json({ message: "Service is deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getServices = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  try {
    const findService = await knex("services");
    return res.status(200).json(findService);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.detailService = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_service = req.query.id;

  try {
    const findItem = await knex("services").where({ id_service });
    if (findItem.length === 0)
      return res.status(404).json({ message: "Service is not found" });

    return res.status(200).json(findItem[0]);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.updateService = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_service = req.query.id;

  const data = {
    service_name: req.body.service_name,
    service_desc: req.body.service_desc,
    service_price: req.body.service_price,
  };

  const { valid, errors } = validateService(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findService = await knex("services").where({ id_service });
    if (findService.length === 0)
      return res.status(404).json({ message: "Service is not found" });

    await knex("services").where({ id_service }).update(data);
    return res.status(200).json({ message: "Service is updated" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// Item Drug ------------------------------------------------------------------
exports.addNewDrug = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  const data = {
    drug_name: req.body.drug_name,
    drug_desc: req.body.drug_desc,
    drug_price: req.body.drug_price,
    drug_count: req.body.drug_count,
  };

  const { valid, errors } = validateDrug(data);
  if (!valid) return res.status(400).json(errors);

  try {
    await knex("drugs").insert(data);
    return res.status(200).json({ message: "Drug is added" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getDrugs = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  try {
    const findDrugs = await knex("drugs");
    return res.status(200).json(findDrugs);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.detailDrug = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_drug = req.query.id;

  try {
    const findDrug = await knex("drugs").where({ id_drug });
    if (findDrug.length === 0)
      return res.status(404).json({ message: "Drug is not found" });

    return res.status(200).json(findDrug[0]);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deleteDrug = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_drug = req.query.id;
  try {
    const findItem = await knex("drugs").where({ id_drug });
    if (findItem.length === 0)
      return res.status(404).json({ message: "Drug is not found" });

    await knex("drugs").where({ id_drug }).del();
    return res.status(200).json({ message: "Drug is deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.updateDrug = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_drug = req.query.id;

  const data = {
    drug_name: req.body.drug_name,
    drug_desc: req.body.drug_desc,
    drug_price: req.body.drug_price,
    drug_count: req.body.drug_count,
  };

  const { valid, errors } = validateDrug(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findDrug = await knex("drugs").where({ id_drug });
    if (findDrug.length === 0)
      return res.status(404).json({ message: "Drug is not found" });

    await knex("drugs").where({ id_drug }).update(data);
    return res.status(200).json({ message: "Drug is updated" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
