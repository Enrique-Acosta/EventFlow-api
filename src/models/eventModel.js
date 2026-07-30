import { Schema, Types, model } from "mongoose";

const eventSchema = new Schema({
   title: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim:true
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum:['draft','published','cancelled','finished'],
        default: 'published'
    },
    organizer:{
        type: Types.ObjectId,
        ref: 'user'
    }
})

export const eventModel = model("event", eventSchema)