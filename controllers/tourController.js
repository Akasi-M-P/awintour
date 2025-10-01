const Tour = require("./../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: "success",
      data: {
        results: tours.length,
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // SEND TOUR TO CLIENT
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

// CREATE A NEW TOUR
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateTour = (req, res) => {
  // Get Param ID and convert it to a number
  const id = req.params.id * 1;

  // Find tour using the ID
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour...>",
    },
  });
};

exports.deleteTour = (req, res) => {
  // Get Param ID and convert it to a number
  const id = req.params.id * 1;

  // Find tour using the ID
  const tour = tours.find((el) => el.id === id);

  res.status(204).json({
    status: "success",
    data: null,
  });
};
