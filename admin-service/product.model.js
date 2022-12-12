"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const ProductShema = new Schema(
	{
		title: {
			type: String,
		},
		image: {
			type: String,
		},
		likes: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Product", ProductShema);
