const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		firstName: String,
		lastName: String,
		username: String,
		email: String,
		password: String,
		imgName: String,
		imgPath: String,
		googleID: String,
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

const User = mongoose.model("User", userSchema);
module.exports = User;
