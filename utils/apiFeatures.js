class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A)Filtering
    // Create a shallow copy of the query object
    // const queryObj = { ...req.query };
    const queryObj = { ...this.queryString };
    // Exclude fields that are not for filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    //1B)Advance Filtering
    // console.log(req.query); //=> // { difficulty: 'easy', duration: { gte: '5' } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr)); //=> // { difficulty: 'easy', duration: { $gte: '5' } }
    // example=>const tours = await Tour.find({ duration: 5, difficulty: 'easy' });
    // const query=Tour.find()//returns a query
    // .where("duration").equals(5).where("difficulty").equals("easy")//chaining over query
    // Build the query using Mongoose
    // let query = Tour.find(JSON.parse(queryStr)); //we can chain other query here
    this.query = this.query.find(JSON.parse(queryStr)); //we can chain other query here

    return this;
  }

  sort() {
    // 2)Sorting
    //if sort property exist
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort("price ratingsAverage")
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // query = query.select('name duration price'); //projecting
    } else {
      this.query = this.query.select(' -__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //converting the string into the number
    const limit = this.queryString.limit * 1 || 100; //limit on sending data
    const skip = (page - 1) * limit; //skiping documents
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
