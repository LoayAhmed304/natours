class APIFeatures {
  constructor(query, queryString) {
    // query is the one we'll awit at the end
    // queryString is the req.query
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    // query = Tour.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.replaceAll(',', ' '));
      // query.sort('createdAt price ....') separated by spaces, not commas
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      this.query = this.query.select(
        this.queryString.fields.replaceAll(',', ' '),
      );
    } else {
      this.query = this.query.select('-__v'); // Exluding "-"
    }

    return this;
  }

  getPage() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = limit * (page - 1);

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
