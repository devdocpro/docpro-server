const isEmpty = (data) => {
  if (data.trim() === "") return true;
  else return false;
};

const validateEmail = (email) => {
  const regEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(regEx)) return true;
  else return false;
};

const checkUsernameIfContainerspecialCharacter = (username) => {
  const format = /[!@#$%^&*()+_\-=\[\]{};':"\\|,.<>\/?]/;
  if (format.test(username)) {
    return { valid: false };
  } else {
    return { valid: true };
  }
};

exports.validateSignupDokter = (data) => {
  let errors = {};

  const lengthUsername = data.username.split(" ").length;
  const fixUsername = data.username.split(" ").join("");
  const { valid } = checkUsernameIfContainerspecialCharacter(data.username);

  //   Check nama
  if (isEmpty(data.nama)) errors.nama = "Nama tidak boleh kosong";
  //   Check NPA
  if (isEmpty(data.npa)) errors.npa = "NPA tidak boleh kosong";
  //   Check alamat
  if (isEmpty(data.alamat)) errors.alamat = "Alamat tidak boleh kosong";
  // Check username
  if (isEmpty(data.username)) {
    errors.username = "Username tidak boleh kosong";
  } else if (lengthUsername > 1) {
    errors.username = `Username tidak boleh memiliki spasi. (${fixUsername})`;
  } else if (!valid) {
    errors.username =
      "Username tidak boleh mengandung special karakter (@#$%^&*.,<>/';:?)";
  }
  //   Check password
  if (isEmpty(data.password)) {
    errors.password = "Password tidak boleh kosong";
  } else if (data.password.length < 6) {
    errors.password = "Password terlalu pendek (min 6)";
  }
  //   Check phone
  if (isEmpty(data.phone)) errors.phone = "No Hp tidak boleh kosong";
  // Check email
  if (isEmpty(data.email)) {
    errors.email = "Email tidak boleh kosong";
  } else if (!validateEmail(data.email)) {
    errors.email = "Email tidak valid";
  }
  // Check tanggal lahir
  if (isEmpty(data.tanggal_lahir))
    errors.tanggal_lahir = "Tanggal Lahir tidak boleh kosong";

  // Return errors and valid
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateUpdateDokter = (data) => {
  let errors = {};

  //   Check nama
  if (isEmpty(data.nama)) errors.nama = "Nama tidak boleh kosong";
  //   Check NPA
  if (isEmpty(data.npa)) errors.npa = "NPA tidak boleh kosong";
  //   Check alamat
  if (isEmpty(data.alamat)) errors.alamat = "Alamat tidak boleh kosong";
  //   Check phone
  if (isEmpty(data.phone)) errors.phone = "No Hp tidak boleh kosong";
  // Check email
  if (isEmpty(data.email)) {
    errors.email = "Email tidak boleh kosong";
  } else if (!validateEmail(data.email)) {
    errors.email = "Email tidak valid";
  }
  // Check tanggal lahir
  if (isEmpty(data.tanggal_lahir))
    errors.tanggal_lahir = "Tanggal Lahir tidak boleh kosong";

  // Return errors and valid
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginDokter = (data) => {
  let errors = {};

  const lengthUsername = data.username.split(" ").length;
  const fixUsername = data.username.split(" ").join("");
  const { valid } = checkUsernameIfContainerspecialCharacter(data.username);

  //    Check username
  if (isEmpty(data.username)) {
    errors.username = "Username tidak boleh kosong";
  } else if (lengthUsername > 1) {
    errors.username = `Username tidak boleh memiliki spasi. (${fixUsername})`;
  } else if (!valid) {
    errors.username =
      "Username tidak boleh mengandung special karakter (@#$%^&*.,<>/';:?)";
  }
  //   Check password
  if (isEmpty(data.password)) {
    errors.password = "Password tidak boleh kosong";
  } else if (data.password.length < 6) {
    errors.password = "Password terlalu pendek (min 6)";
  }

  // Return errors and valid
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

const isInt = (value) => {
  let er = /^-?[0-9]+$/;
  return er.test(value);
};

exports.validatePasien = (data) => {
  let errors = {};

  //   Check nama
  if (isEmpty(data.nama)) errors.nama = "Nama tidak boleh kosong";
  if (isEmpty(data.nik)) {
    errors.nik = "Nik tidak boleh kosong";
  } else if (!isInt(data.nik)) {
    errors.nik = "Nik tidak boleh mengandung huruf";
  } else if (data.nik.length !== 16) {
    errors.nik = "Nik memiliki panjang 16 angka";
  }
  //   Check alamat
  if (isEmpty(data.alamat)) errors.alamat = "Alamat tidak boleh kosong";
  // Check tanggal lahir
  if (isEmpty(data.tanggal_lahir))
    errors.tanggal_lahir = "Tanggal Lahir tidak boleh kosong";
  //   Check phone
  if (isEmpty(data.phone)) errors.phone = "No Hp tidak boleh kosong";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateService = (data) => {
  let errors = {};

  if (isEmpty(data.service_name))
    errors.service_name = "Nama service tidak boleh kosong";
  if (isEmpty(data.service_desc))
    errors.service_desc = "service description tidak boleh kosong";
  if (isEmpty(data.service_price)) {
    errors.service_price = "harga servie tidak boleh kosong";
  } else if (!isInt(data.service_price)) {
    errors.service_price = "harga service tidak boleh mengandung huruf";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateDrug = (data) => {
  let errors = {};

  if (isEmpty(data.drug_name))
    errors.drug_name = "nama obat tidak boleh kosong";
  if (isEmpty(data.drug_desc))
    errors.drug_desc = "deskripsi obat tidak boleh kosong";
  if (isEmpty(data.drug_price)) {
    errors.drug_price = "harga obat tidak boleh kosong";
  } else if (!isInt(data.drug_price)) {
    errors.drug_price = "harga obat tidak boleh mengandung huruf";
  }
  if (isEmpty(data.drug_count)) {
    errors.drug_count = "jumlah obat tidak boleh kosong";
  } else if (!isInt(data.drug_count)) {
    errors.drug_count = "jumlah obat tidak boleh mengandung huruf";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateAppointment = (data) => {
  let errors = {};

  if (isEmpty(data.id_pasien)) errors.id_pasien = "Tidak ada id pasien";
  if (isEmpty(data.keperluan))
    errors.keperluan = "Keperluan tidak boleh kosong";
  if (isEmpty(data.tanggal)) errors.tanggal = "Tanggal tidak boleh kosong";
  if (isEmpty(data.jam)) errors.jam = "Jam tidak boleh kosong";
  if (isEmpty(data.keluhan)) errors.keluhan = "Keluhan tidak boleh kosong";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateDiagnosa = (data) => {
  let errors = {};

  //   Check penanganan
  if (isEmpty(data.penanganan))
    errors.penanganan = "Penanganan tidak boleh kosong";
  if (!isInt(data.total_biaya)) errors.total_biaya = "Total biaya harus int";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
