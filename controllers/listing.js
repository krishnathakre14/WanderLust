const mongoose = require("mongoose");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});
  
   

    module.exports.renderNewForm = (req,res)=>{
        
        res.render("listings/new.ejs");
    };

    module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

    module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found!");
    }

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    originalImageUrl =listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/show.ejs", { listing });
};

  module.exports.createListing = async (req, res, next) => {
    // Get coordinates from Mapbox
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
        console.log("MAPBOX COORDINATES:", response.body.features[0].geometry.coordinates);

    // Image information
    let url = req.file.path;
    let filename = req.file.filename;

    // Create listing
    const newListing = new Listing(req.body.listing);

    // Owner
    newListing.owner = req.user._id;

    // Image
    newListing.image = {
        url,
        filename
    };

    // Location coordinates
    newListing.geometry = response.body.features[0].geometry;

    // Save
    let savedListing = await newListing.save();

    console.log(savedListing.geometry);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};
    module.exports.renderEditForm = async (req,res)=>{
             let  {id}=req.params;
            const listing = await Listing.findById(id);
            res.render("listings/edit.ejs",{listing})
    };
    module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

   module.exports.destroyListing = async (req, res) => {
    console.log("DELETE ROUTE REACHED");
    console.log("ID:", req.params.id);

    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log("Deleted:", deletedListing);

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
};