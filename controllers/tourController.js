const Tour = require("./../models/tourModel");

// THIS ROUTES GETS THE TOP 5 CHEAPEST TOURS
exports.aliasTopTours = (req, res, next) => {
  console.log("Alias middleware triggered");
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  console.log("Alias middleware triggered");
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // GET A COPY OF THE QUERY OBJECT AND ASSIGN IT TO A VARIABLE
    const queryObj = { ...req.query };

    // GROUP QUERY FIELDS INTO AN ARRAY AND ASSIGN THEM TO A VARIABLE
    const excludeFields = ["page", "sort", "limit", "fields"];

    // DELETE EACH QUERY FIELD IN THE EXCLUDE FIELDS ARRAY FROM THE QUERY OBJECT
    excludeFields.forEach((el) => delete queryObj[el]);

    // ADD >=,>,<=,< TO QUERY FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // FILTER QUERY BY SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");

      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // LIMITING FIELDS SO THAT ONLY SELECT FIELDS WILL BE SENT AS RESPONSE AND DESELECTED FIELDS WITH (-) WILL BE EXCLUDE FROM RESPONSE AS WELL
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //  PAGINATION LOGIC
    // Pagination allows clients to request a specific "page" of results,
    // instead of loading all documents at once (which can be slow and memory-heavy).

    // STEP 1: Extract pagination parameters from the query string
    // Example request: /api/v1/tours?page=2&limit=10
    // 'page' = which page to view, 'limit' = number of documents per page
    // The `* 1` converts them from strings to numbers
    const page = req.query.page * 1 || 1; // Default to page 1 if not specified
    const limit = req.query.limit * 1 || 100; // Default to 100 documents per page

    // STEP 2: Calculate how many documents to skip
    // If page=1 → skip=0 (start from the first document)
    // If page=2 and limit=10 → skip=(2-1)*10=10 (skip the first 10 documents)
    const skip = (page - 1) * limit;

    // STEP 3: Apply pagination to the query
    // `skip()` tells MongoDB how many docs to ignore before starting to return results
    // `limit()` tells MongoDB how many docs to actually return
    query = query.skip(skip).limit(limit);

    // STEP 4: Optional check — handle non-existent pages
    // If the client requests a page beyond the total number of documents,
    // throw an error to indicate that the page doesn’t exist.
    if (req.query.page) {
      const numTours = await Tour.countDocuments(); // Count total documents
      if (skip >= numTours) throw new Error("This page does not exist");
    }

    const tours = await query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
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

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
