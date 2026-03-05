class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering (gte, gt, lte, lt, ne)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, match => `$${match}`);

        let filterObj = JSON.parse(queryStr);

        // Handle comma separated values for specific fields (multi-select filter)
        const multiSelectFields = ['sizes', 'colors', 'brand', 'category', 'fabric', 'occasion'];
        multiSelectFields.forEach(field => {
            if (this.queryString[field] && typeof this.queryString[field] === 'string') {
                const values = this.queryString[field].split(',');
                if (values.length > 1) {
                    filterObj[field] = { $in: values };
                }
            }
        });

        if (this.queryString.sale === 'true') {
            filterObj.discountPrice = { $exists: true, $ne: null };
        }
        this.query = this.query.find(filterObj);

        return this;
    }

    search() {
        if (this.queryString.search) {
            this.query = this.query.find({
                name: { $regex: this.queryString.search, $options: 'i' }
            });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
