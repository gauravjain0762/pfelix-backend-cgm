const express = require("express");
const router = express.Router();

const { medications, jobTypes } = require("../config/constants");

router.get("/medications", (req, res) => {

  const data = Object.entries(medications).map(([id, value]) => ({
    id: Number(id),
    name: value.name
  }));

  res.json(data);
});

router.get("/job-types", (req, res) => {

  const data = Object.entries(jobTypes).map(([id, value]) => ({
    id: Number(id),
    name: value.name
  }));

  res.json(data);
});

module.exports = router;