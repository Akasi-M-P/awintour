class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // GET A COPY OF THE QUERY OBJECT AND ASSIGN IT TO A VARIABLE
    const queryObj = { ...this.queryString };

    // GROUP QUERY FIELDS INTO AN ARRAY AND ASSIGN THEM TO A VARIABLE
    const excludeFields = ["page", "sort", "limit", "fields"];

    // DELETE EACH QUERY FIELD IN THE EXCLUDE FIELDS ARRAY FROM THE QUERY OBJECT
    excludeFields.forEach((el) => delete queryObj[el]);

    // ADD >=,>,<=,< TO QUERY FILTERING
    this.queryString = JSON.stringify(queryObj);
    this.queryString = this.queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(this.queryString));

    return this;
  }

  sort() {
    // FILTER QUERY BY SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // LIMITING FIELDS SO THAT ONLY SELECT FIELDS WILL BE SENT AS RESPONSE AND DESELECTED FIELDS WITH (-) WILL BE EXCLUDE FROM RESPONSE AS WELL
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    //  PAGINATION LOGIC
    // Pagination allows clients to request a specific "page" of results,
    // instead of loading all documents at once (which can be slow and memory-heavy).

    // STEP 1: Extract pagination parameters from the query string
    // Example request: /api/v1/tours?page=2&limit=10
    // 'page' = which page to view, 'limit' = number of documents per page
    // The `* 1` converts them from strings to numbers
    const page = this.queryString.page * 1 || 1; // Default to page 1 if not specified
    const limit = this.queryString.limit * 1 || 100; // Default to 100 documents per page

    // STEP 2: Calculate how many documents to skip
    // If page=1 → skip=0 (start from the first document)
    // If page=2 and limit=10 → skip=(2-1)*10=10 (skip the first 10 documents)
    const skip = (page - 1) * limit;

    // STEP 3: Apply pagination to the query
    // `skip()` tells MongoDB how many docs to ignore before starting to return results
    // `limit()` tells MongoDB how many docs to actually return
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
