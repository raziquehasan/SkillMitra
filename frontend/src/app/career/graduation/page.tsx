"use client";

import { useMemo, useState } from "react";

type CareerData = {
  district: string;
  sector: string;
  skills: string;
  training: string;
  roles: string;
};

const data: CareerData[] = [
  {
    district: "Mumbai City",
    sector: "BFSI",
    skills: "FinTech; accounting; analytics; cyber",
    training: "MBA/MMS; MCA; MSc Data; MCom",
    roles: "Finance",
  },
  {
    district: "Mumbai City",
    sector: "media",
    skills: "digital marketing",
    training: "MA",
    roles: "Media",
  },
  {
    district: "Mumbai City",
    sector: "healthcare",
    skills:
      "Healthcare administration; health informatics; clinical data; patient care",
    training: "MHA/MPH; MSc Health Informatics; Healthcare Management",
    roles: "Healthcare",
  },
  {
    district: "Mumbai City",
    sector: "services",
    skills: "analytics; digital marketing",
    training: "MSc Data; MCA; MBA/MMS; MA; MCom",
    roles: "Business Analyst; Digital",
  },

  {
    district: "Mumbai Suburban",
    sector: "IT",
    skills: "Software; AI/ML; cloud; UX",
    training: "MCA; MSc CS/Data; media/design",
    roles: "Data; Product",
  },
  {
    district: "Mumbai Suburban",
    sector: "BFSI",
    skills: "finance",
    training: "MBA/MMS; MCom",
    roles: "Finance",
  },
  {
    district: "Mumbai Suburban",
    sector: "media",
    skills: "media",
    training: "media/design",
    roles: "Media",
  },
  {
    district: "Mumbai Suburban",
    sector: "retail",
    skills: "finance",
    training: "MBA/MMS; MCom",
    roles: "Retail Analyst; Store Operations",
  },

  {
    district: "Thane",
    sector: "Engineering",
    skills: "Automation; PLC; CAD/CAM",
    training: "MTech",
    roles: "Automation",
  },
  {
    district: "Thane",
    sector: "manufacturing",
    skills: "Automation",
    training: "MTech",
    roles: "Automation",
  },
  {
    district: "Thane",
    sector: "logistics",
    skills: "supply chain",
    training: "MBA; MTech",
    roles: "Supply Chain",
  },
  {
    district: "Thane",
    sector: "IT",
    skills: "data",
    training: "MSc Data; MCA",
    roles: "Data",
  },

  {
    district: "Palghar",
    sector: "Manufacturing",
    skills: "Production; automation; quality control; maintenance",
    training: "MTech; ME; PG Diploma Production/Industrial Engineering",
    roles: "Production Engineer; QA/QC",
  },
  {
    district: "Palghar",
    sector: "chemicals",
    skills: "Safety; QA/QC",
    training: "MTech",
    roles: "Process Engineer; QA/QC",
  },
  {
    district: "Palghar",
    sector: "engineering",
    skills: "Safety; production; electrical",
    training: "MTech",
    roles: "Production; QA; Safety",
  },
  {
    district: "Palghar",
    sector: "logistics",
    skills: "logistics",
    training: "MBA; MTech",
    roles: "Logistics",
  },
  {
    district: "Palghar",
    sector: "fisheries",
    skills:
      "Fisheries management; aquaculture; cold chain; marine skills",
    training:
      "MSc Fisheries; PG Diploma Fisheries/Aquaculture; MBA Agri-business",
    roles: "Fisheries Officer; Aquaculture",
  },

  {
    district: "Raigad",
    sector: "Ports",
    skills: "Port logistics; supply chain",
    training: "MBA; MTech",
    roles: "Port Operations; Logistics",
  },
  {
    district: "Raigad",
    sector: "logistics",
    skills: "Port logistics; supply chain",
    training: "MBA; MTech",
    roles: "Logistics",
  },
  {
    district: "Raigad",
    sector: "chemicals",
    skills: "process engineering; safety",
    training: "MTech; MSc Chemistry",
    roles: "Process Engineer; QA/QC",
  },
  {
    district: "Raigad",
    sector: "manufacturing",
    skills: "process engineering; safety",
    training: "MTech; MSc Chemistry",
    roles: "Process; QA",
  },
  {
    district: "Raigad",
    sector: "tourism",
    skills: "hospitality",
    training: "HMCT",
    roles: "Hospitality",
  },

  {
    district: "Ratnagiri",
    sector: "Agriculture",
    skills: "Food processing; GIS",
    training: "MSc Agri/Food",
    roles: "Agri-business",
  },
  {
    district: "Ratnagiri",
    sector: "fisheries",
    skills: "fisheries; cold chain",
    training: "Fisheries; MBA; MSc Agri/Food",
    roles: "Fisheries",
  },
  {
    district: "Ratnagiri",
    sector: "tourism",
    skills: "hospitality",
    training: "HMCT",
    roles: "Tourism",
  },
  {
    district: "Ratnagiri",
    sector: "food",
    skills: "Food processing; cold chain",
    training: "MSc Agri/Food; MBA",
    roles: "Food; Agri-business",
  },

  {
    district: "Sindhudurg",
    sector: "Tourism",
    skills:
      "Hospitality management; tourism operations; digital marketing; customer service",
    training: "HMCT; MBA Tourism/Hospitality; PG Diploma Tourism",
    roles: "Hotel/Tourism Manager",
  },
  {
    district: "Sindhudurg",
    sector: "fisheries",
    skills: "marine skills",
    training:
      "MSc Fisheries; PG Diploma Fisheries/Aquaculture; MBA Agri-business",
    roles: "Fisheries/Aquaculture",
  },
  {
    district: "Sindhudurg",
    sector: "agriculture",
    skills: "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Sindhudurg",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food; Agri-business",
  },

  {
    district: "Nashik",
    sector: "Automotive",
    skills: "Production; CNC; quality",
    training: "MTech",
    roles: "Automotive; QA",
  },
  {
    district: "Nashik",
    sector: "engineering",
    skills: "Production; CNC; quality",
    training: "MTech",
    roles: "QA",
  },
  {
    district: "Nashik",
    sector: "agriculture",
    skills: "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Nashik",
    sector: "food",
    skills: "quality; food tech",
    training: "MTech; MSc Food/Agri",
    roles: "Food; Agri-tech",
  },
  {
    district: "Nashik",
    sector: "healthcare",
    skills:
      "Healthcare administration; health informatics; clinical data; patient care",
    training:
      "MHA/MPH; MSc Health Informatics; Healthcare Management",
    roles: "Healthcare Administrator",
  },

  {
    district: "Dhule",
    sector: "Agriculture",
    skills: "Food; logistics",
    training: "MBA",
    roles: "Agri-business",
  },
  {
    district: "Dhule",
    sector: "textiles",
    skills: "textile",
    training:
      "MTech Textile; MSc Textile Technology; MBA Operations",
    roles: "Textile Technologist; Production",
  },
  {
    district: "Dhule",
    sector: "logistics",
    skills: "logistics",
    training: "MBA; MTech",
    roles: "Logistics",
  },
  {
    district: "Dhule",
    sector: "manufacturing",
    skills: "electrical",
    training: "MTech",
    roles: "Production Engineer",
  },

  {
    district: "Nandurbar",
    sector: "Agriculture",
    skills:
      "Agri-tech; irrigation; food; GIS; entrepreneurship",
    training: "MSc Agriculture; Development PG; MBA",
    roles: "Agri; GIS",
  },
  {
    district: "Nandurbar",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Nandurbar",
    sector: "rural development",
    skills: "Agri-tech; GIS; entrepreneurship",
    training:
      "MSc Agriculture; Development Studies PG; MBA",
    roles: "Agri; GIS; Rural Enterprise",
  },

  {
    district: "Jalgaon",
    sector: "Agriculture",
    skills: "Agri-tech; food; supply chain",
    training: "MSc Agri/Food; MBA; MTech",
    roles: "Agri",
  },
  {
    district: "Jalgaon",
    sector: "food",
    skills: "food; cold chain; supply chain",
    training: "MBA; MSc Agri/Food; MTech",
    roles: "Agri; Food",
  },
  {
    district: "Jalgaon",
    sector: "engineering",
    skills: "mechanical",
    training: "MTech",
    roles: "Engineering",
  },
  {
    district: "Jalgaon",
    sector: "trading",
    skills: "supply chain",
    training: "MBA; MTech",
    roles: "Procurement; Trading",
  },

  {
    district: "Ahmednagar",
    sector: "Automotive",
    skills: "Mechanical; production; automation",
    training: "MTech",
    roles: "Automotive Engineer",
  },
  {
    district: "Ahmednagar",
    sector: "sugar",
    skills: "Mechanical; production; dairy/food; automation",
    training: "MTech; MSc Agri/Food",
    roles: "Sugar",
  },
  {
    district: "Ahmednagar",
    sector: "dairy",
    skills: "production; dairy/food",
    training: "MTech; MSc Agri/Food",
    roles: "Dairy",
  },
  {
    district: "Ahmednagar",
    sector: "agriculture",
    skills:
      "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Ahmednagar",
    sector: "engineering",
    skills: "Mechanical; production; automation",
    training: "MTech",
    roles: "Design Engineer; Automation",
  },

  {
    district: "Pune",
    sector: "Automotive",
    skills: "embedded; EV; robotics; CAD",
    training: "MTech",
    roles: "EV; Robotics",
  },
  {
    district: "Pune",
    sector: "engineering",
    skills: "embedded; robotics; CAD",
    training: "MTech",
    roles: "Robotics",
  },
  {
    district: "Pune",
    sector: "IT",
    skills: "AI/ML; software; EV; data",
    training: "MCA; MTech",
    roles: "Product",
  },
  {
    district: "Pune",
    sector: "electronics",
    skills: "embedded; robotics; data",
    training: "MTech; MCA",
    roles: "Robotics",
  },
  {
    district: "Pune",
    sector: "biotech",
    skills: "data",
    training: "MCA",
    roles: "R&D",
  },

  {
    district: "Satara",
    sector: "Automotive",
    skills: "Mechanical; quality",
    training: "MTech",
    roles: "Engineering",
  },
  {
    district: "Satara",
    sector: "food/agri",
    skills: "quality; food; supply chain",
    training: "MTech; MBA",
    roles: "Food",
  },
  {
    district: "Satara",
    sector: "tourism",
    skills: "hospitality",
    training: "HMCT",
    roles: "Tourism",
  },

  {
    district: "Sangli",
    sector: "Sugar",
    skills:
      "Sugar process technology; production; quality; automation",
    training:
      "MTech Chemical/Production; MSc Food Technology; MBA Operations",
    roles: "Sugar Process Engineer",
  },
  {
    district: "Sangli",
    sector: "food/agri",
    skills: "Food tech; agri; quality; supply chain",
    training: "MTech; MBA",
    roles: "Food; Agri-business",
  },
  {
    district: "Sangli",
    sector: "engineering",
    skills: "Mechanical; quality",
    training: "MTech",
    roles: "Engineering",
  },
  {
    district: "Sangli",
    sector: "textiles",
    skills: "quality; supply chain",
    training: "MTech; MBA",
    roles: "Textile Technologist; Production",
  },

  {
    district: "Kolhapur",
    sector: "Engineering",
    skills: "CNC; CAD/CAM; quality; automation",
    training: "MTech",
    roles: "Foundry; Production",
  },
  {
    district: "Kolhapur",
    sector: "foundry",
    skills: "CNC; foundry; CAD/CAM; quality",
    training: "MTech",
    roles: "Auto Components; Production",
  },
  {
    district: "Kolhapur",
    sector: "auto components",
    skills: "CNC; CAD/CAM; quality; automation",
    training: "MTech",
    roles: "Auto Components",
  },
  {
    district: "Kolhapur",
    sector: "food",
    skills: "quality",
    training: "MTech",
    roles: "Food Technologist; QA/QC",
  },

  {
    district: "Solapur",
    sector: "Textiles",
    skills:
      "Textile technology; production; quality; supply chain",
    training:
      "MTech Textile; MSc Textile Technology; MBA Operations",
    roles: "Textile Technologist; Production",
  },
  {
    district: "Solapur",
    sector: "engineering",
    skills: "mechanical; electrical",
    training: "MTech",
    roles: "Engineering",
  },
  {
    district: "Solapur",
    sector: "food",
    skills: "supply chain",
    training: "MBA; MTech",
    roles: "Food Technologist; QA/QC",
  },
  {
    district: "Solapur",
    sector: "renewable energy",
    skills: "solar; electrical",
    training: "MSc Textile/Energy; MTech",
    roles: "Renewable Energy",
  },

  {
    district: "Jalna",
    sector: "Steel",
    skills:
      "Metallurgy; production; quality control; maintenance",
    training: "MTech Metallurgy/Production; MSc Materials Science",
    roles: "Metallurgy Engineer",
  },
  {
    district: "Jalna",
    sector: "agro-processing",
    skills: "production; agri-tech; quality",
    training: "MTech",
    roles: "Agri",
  },
  {
    district: "Jalna",
    sector: "seed/agriculture",
    skills: "agri-tech",
    training:
      "MSc Seed Technology/Agriculture; MBA Agri-business",
    roles: "Agri",
  },
  {
    district: "Jalna",
    sector: "engineering",
    skills: "production; quality; maintenance",
    training: "MTech",
    roles: "Production; QA",
  },

  {
    district: "Beed",
    sector: "Agriculture",
    skills:
      "Agri-tech; irrigation; food; entrepreneurship; GIS",
    training: "MBA; Development PG",
    roles: "Agri-business",
  },
  {
    district: "Beed",
    sector: "sugar",
    skills: "food",
    training:
      "MTech Chemical/Production; MSc Food Technology; MBA Operations",
    roles: "Food",
  },
  {
    district: "Beed",
    sector: "rural economy",
    skills: "Agri-tech; entrepreneurship; GIS",
    training: "MBA; Development PG",
    roles: "Agri-business",
  },
  {
    district: "Beed",
    sector: "services",
    skills: "entrepreneurship",
    training: "MBA",
    roles: "Business Analyst",
  },

  {
    district: "Latur",
    sector: "Food/agri processing",
    skills: "Food tech; agri; logistics",
    training: "MSc Food Technology; MBA",
    roles: "Food",
  },
  {
    district: "Latur",
    sector: "education",
    skills: "data",
    training: "MCA; health/education PG",
    roles: "Education",
  },
  {
    district: "Latur",
    sector: "healthcare",
    skills: "healthcare admin",
    training: "health/education PG",
    roles: "Healthcare",
  },
  {
    district: "Latur",
    sector: "manufacturing",
    skills:
      "Production; automation; quality control; maintenance",
    training: "MTech; PG Diploma Production/Industrial Engineering",
    roles: "Production Engineer",
  },

  {
    district: "Dharashiv",
    sector: "Agriculture",
    skills: "Agri-tech; food; entrepreneurship",
    training: "MSc Agri/Food; MBA",
    roles: "Agri-business",
  },
  {
    district: "Dharashiv",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Dharashiv",
    sector: "small manufacturing",
    skills: "mechanical",
    training: "MTech",
    roles: "Production",
  },
  {
    district: "Dharashiv",
    sector: "tourism",
    skills:
      "Hospitality management; tourism operations; digital marketing; customer service",
    training: "HMCT; MBA Tourism/Hospitality",
    roles: "Hotel/Tourism Manager",
  },

  {
    district: "Nanded",
    sector: "Agriculture",
    skills: "Agri-tech; logistics",
    training: "MBA",
    roles: "Agri-business",
  },
  {
    district: "Nanded",
    sector: "healthcare",
    skills: "healthcare",
    training: "health/education PG",
    roles: "Healthcare",
  },
  {
    district: "Nanded",
    sector: "education",
    skills: "data; education",
    training: "MCA",
    roles: "Education",
  },

  {
    district: "Parbhani",
    sector: "Agriculture",
    skills: "Agronomy; agri analytics; seed tech; food",
    training: "MSc Agriculture",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Parbhani",
    sector: "seed",
    skills: "Agronomy; agri analytics; seed tech",
    training: "MSc Agriculture",
    roles: "Seed",
  },
  {
    district: "Parbhani",
    sector: "agri research",
    skills: "Agronomy; agri analytics; seed tech",
    training: "MSc Agriculture",
    roles: "Agri Research",
  },
  {
    district: "Parbhani",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },

  {
    district: "Hingoli",
    sector: "Agriculture",
    skills: "Agri-tech; food; GIS; entrepreneurship",
    training: "MSc Agri/Food; MBA",
    roles: "Agri-business",
  },
  {
    district: "Hingoli",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Hingoli",
    sector: "rural services",
    skills:
      "Digital services; entrepreneurship; GIS; data analytics",
    training: "MBA; MCA; Development Studies PG",
    roles: "Rural Services Manager",
  },

  {
    district: "Amravati",
    sector: "Textiles",
    skills:
      "Textile technology; production; quality; supply chain",
    training:
      "MTech Textile; MSc Textile Technology; MBA Operations",
    roles: "Textile Technologist",
  },
  {
    district: "Amravati",
    sector: "agriculture",
    skills:
      "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Amravati",
    sector: "education",
    skills: "data",
    training: "MCA",
    roles: "Education Administrator",
  },
  {
    district: "Amravati",
    sector: "manufacturing",
    skills: "electrical; quality",
    training: "MTech",
    roles: "Manufacturing",
  },

  {
    district: "Akola",
    sector: "Agriculture",
    skills: "Agri analytics; seed tech; food; GIS",
    training: "MSc Agriculture",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Akola",
    sector: "food",
    skills: "food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Akola",
    sector: "seed",
    skills: "Agri analytics; seed tech; GIS",
    training: "MSc Agriculture",
    roles: "Seed Technologist",
  },
  {
    district: "Akola",
    sector: "education",
    skills:
      "Educational technology; data analytics; administration; digital learning",
    training: "MEd; MA Education; MCA/MSc Data",
    roles: "Education Administrator",
  },

  {
    district: "Buldhana",
    sector: "Agriculture",
    skills: "Food; agri-tech; entrepreneurship",
    training: "MSc Agri/Food; MBA",
    roles: "Agri",
  },
  {
    district: "Buldhana",
    sector: "food",
    skills: "Food",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Buldhana",
    sector: "textiles",
    skills: "textile",
    training:
      "MTech Textile; MSc Textile Technology; MBA Operations",
    roles: "Textile",
  },
  {
    district: "Buldhana",
    sector: "small industry",
    skills: "electrical; entrepreneurship",
    training: "MTech; MBA",
    roles: "Production",
  },

  {
    district: "Washim",
    sector: "food",
    skills: "food; supply chain",
    training:
      "MSc Food Technology; MSc Food Science; MBA Food/Agri-business",
    roles: "Food",
  },
  {
    district: "Washim",
    sector: "rural economy",
    skills: "Agri-tech; GIS; supply chain",
    training: "MSc Agri/Food; MBA Agri-business",
    roles: "Agri-business Manager",
  },

  {
    district: "Yavatmal",
    sector: "Cotton/textiles",
    skills: "Textile",
    training: "MSc Agri/Textile",
    roles: "Textile Technologist",
  },
  {
    district: "Yavatmal",
    sector: "agriculture",
    skills:
      "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Yavatmal",
    sector: "mining-related",
    skills: "electrical; safety",
    training: "MTech",
    roles: "Mining Engineer",
  },
  {
    district: "Yavatmal",
    sector: "services",
    skills:
      "Data analytics; digital marketing; customer operations; communication",
    training:
      "MBA/MMS; MCA; MSc Data Analytics; PG Diploma Digital Marketing",
    roles: "Operations",
  },

  {
    district: "Nagpur",
    sector: "Logistics",
    skills:
      "Supply chain; warehouse management; transport logistics; analytics",
    training:
      "MBA Supply Chain; MTech; PG Diploma Logistics",
    roles: "Supply Chain Analyst",
  },
  {
    district: "Nagpur",
    sector: "manufacturing",
    skills: "mining safety; electrical",
    training: "MTech",
    roles: "Production Engineer",
  },
  {
    district: "Nagpur",
    sector: "IT",
    skills: "Data/AI",
    training: "MSc Data; MCA",
    roles: "IT",
  },
  {
    district: "Nagpur",
    sector: "mining",
    skills: "mining safety; electrical",
    training: "MTech",
    roles: "Mining",
  },
  {
    district: "Nagpur",
    sector: "healthcare",
    skills: "healthcare",
    training: "health PG",
    roles: "Healthcare",
  },

  {
    district: "Wardha",
    sector: "Education",
    skills:
      "Educational technology; data analytics; administration; digital learning",
    training: "MEd; MA Education; MCA/MSc Data",
    roles: "Education Administrator",
  },
  {
    district: "Wardha",
    sector: "healthcare",
    skills: "healthcare",
    training: "health/education PG",
    roles: "Healthcare",
  },
  {
    district: "Wardha",
    sector: "agriculture",
    skills:
      "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Wardha",
    sector: "services",
    skills: "data; social development",
    training: "MCA",
    roles: "Business Analyst",
  },

  {
    district: "Bhandara",
    sector: "Rice/agriculture",
    skills: "Rice/food processing; GIS; quality",
    training: "MSc Agri/Food/Forestry; MTech",
    roles: "Engineering",
  },
  {
    district: "Bhandara",
    sector: "engineering",
    skills: "Rice/food processing; mechanical; quality",
    training: "MSc Agri/Food/Forestry; MTech",
    roles: "Forest Resource Manager",
  },
  {
    district: "Bhandara",
    sector: "forest economy",
    skills: "forestry; GIS",
    training: "MSc Agri/Food/Forestry",
    roles: "Forestry",
  },

  {
    district: "Gondia",
    sector: "Rice/agriculture",
    skills: "Food; GIS; agri-tech",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agri",
  },
  {
    district: "Gondia",
    sector: "forestry",
    skills: "forestry; GIS",
    training: "MSc Forestry; MSc GIS/Environmental Science",
    roles: "Forest",
  },
  {
    district: "Gondia",
    sector: "logistics",
    skills: "GIS",
    training: "MBA",
    roles: "Logistics",
  },
  {
    district: "Gondia",
    sector: "tourism",
    skills: "hospitality",
    training: "HMCT",
    roles: "Tourism",
  },

  {
    district: "Chandrapur",
    sector: "Coal/mining",
    skills: "Mining; electrical; safety",
    training: "MTech; MSc Geology/Environment",
    roles: "Mining Engineer",
  },
  {
    district: "Chandrapur",
    sector: "power",
    skills: "electrical; mechanical; safety",
    training: "MTech",
    roles: "Power",
  },
  {
    district: "Chandrapur",
    sector: "cement",
    skills: "mechanical; safety; environment",
    training: "MTech; MSc Geology/Environment",
    roles: "Cement; Safety",
  },
  {
    district: "Chandrapur",
    sector: "manufacturing",
    skills: "Mining; electrical; mechanical; safety",
    training: "MTech; MSc Geology/Environment",
    roles: "Safety",
  },

  {
    district: "Gadchiroli",
    sector: "Forestry",
    skills:
      "Forest management; GIS; biodiversity; remote sensing",
    training: "MSc Forestry; MSc GIS/Environmental Science",
    roles: "Forest Officer; GIS Analyst",
  },
  {
    district: "Gadchiroli",
    sector: "mining",
    skills: "mining safety",
    training:
      "MTech Mining; MSc Geology/Environment; PG Diploma Mining",
    roles: "Mining",
  },
  {
    district: "Gadchiroli",
    sector: "agriculture",
    skills:
      "Agri-tech; agronomy; irrigation; GIS; supply chain",
    training:
      "MSc Agriculture; MSc Agri-business/Food; MBA Agri-business",
    roles: "Agronomist; Agri-business",
  },
  {
    district: "Gadchiroli",
    sector: "rural development",
    skills: "GIS; agri-tech",
    training:
      "MSc Agriculture; Development Studies PG; MBA Agri-business",
    roles: "Rural Development Officer",
  },
];

export default function GraduationPage() {
  const [district, setDistrict] = useState("All");
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");

  const districts = useMemo(
    () => ["All", ...Array.from(new Set(data.map((item) => item.district)))],
    []
  );

  const sectors = useMemo(() => {
    const filtered =
      district === "All"
        ? data
        : data.filter((item) => item.district === district);

    return [
      "All",
      ...Array.from(new Set(filtered.map((item) => item.sector))),
    ];
  }, [district]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const districtMatch =
        district === "All" || item.district === district;

      const sectorMatch =
        sector === "All" || item.sector === sector;

      const text =
        `${item.district} ${item.sector} ${item.skills} ${item.training} ${item.roles}`.toLowerCase();

      const searchMatch =
        search.trim() === "" ||
        text.includes(search.toLowerCase());

      return districtMatch && sectorMatch && searchMatch;
    });
  }, [district, sector, search]);

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setSector("All");
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Government Top Bar */}
      <div className="bg-blue-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-sm">
          <p>Government of Maharashtra</p>
          <p>Skill Development & Career Guidance</p>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* SkillMitra Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/skillmitra-logo.png"
              alt="SkillMitra"
              className="h-14 w-auto object-contain"
            />

            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Career & Skill Intelligence
              </p>
              <h1 className="text-xl font-bold text-blue-900">
                Graduate Career Explorer
              </h1>
            </div>
          </div>

          {/* Maharashtra Government Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              className="h-14 w-auto object-contain"
            />

            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-slate-800">
                Government of Maharashtra
              </p>
              <p className="text-xs text-slate-500">
                Skill Development
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Maharashtra Graduate Career Intelligence
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Explore Careers Based on Industry Demand
            </h2>

            <p className="mt-3 text-base leading-7 text-slate-600">
              Find priority skills, higher education options,
              training pathways and job roles based on your
              district and industry.
            </p>
          </div>

        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Find Opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select your location and industry to explore relevant
              career pathways.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* District */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                District
              </label>

              <select
                value={district}
                onChange={(e) =>
                  handleDistrictChange(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {districts.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-white text-slate-900"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sector / Industry
              </label>

              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {sectors.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-white text-slate-900"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, courses or jobs..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Results Header */}
      <section className="mx-auto max-w-7xl px-6 pb-3">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Industry Demand & Career Opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredData.length} matching records
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Active Filters
            </p>

            <p className="mt-1 text-sm font-bold text-blue-900">
              {district === "All" ? "All Districts" : district}
              {" • "}
              {sector === "All" ? "All Sectors" : sector}
            </p>
          </div>

        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-5">

        <div className="grid gap-5">

          {filteredData.map((item, index) => (
            <article
              key={`${item.district}-${item.sector}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              {/* Card Header */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                <div>
                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.district}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {item.sector}
                    </span>

                  </div>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {item.sector}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Industry demand identified for {item.district}
                  </p>
                </div>

                {/* Job Role */}
                <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 lg:max-w-sm">

                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                    Job Roles
                  </p>

                  <p className="mt-2 font-semibold leading-6 text-slate-800">
                    {item.roles}
                  </p>

                </div>

              </div>

              {/* Information */}
              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Skills */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>

                    <h4 className="font-bold text-blue-900">
                      Priority Skills
                    </h4>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {item.skills
                      .split(";")
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          {skill.trim()}
                        </span>
                      ))}

                  </div>

                </div>

                {/* Training */}
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">

                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>

                    <h4 className="font-bold text-amber-900">
                      PG / Training Options
                    </h4>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {item.training
                      .split(";")
                      .map((course) => (
                        <span
                          key={course}
                          className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          {course.trim()}
                        </span>
                      ))}

                  </div>

                </div>

              </div>

            </article>
          ))}

        </div>

        {/* No Results */}
        {filteredData.length === 0 && (
          <div className="rounded-2xl border bg-white p-12 text-center">

            <div className="text-4xl">🔍</div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No matching opportunities found
            </h3>

            <p className="mt-2 text-slate-500">
              Try another district, sector or search keyword.
            </p>

          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="border-t bg-blue-950 text-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">
            <img
              src="/skillmitra-logo.png"
              alt="SkillMitra"
              className="h-10 w-auto"
            />

            <div>
              <p className="font-semibold">
                SkillMitra
              </p>

              <p className="text-xs text-blue-200">
                Career & Skill Intelligence Platform
              </p>
            </div>
          </div>

          <p className="text-sm text-blue-200">
            Maharashtra Industry Demand & Career Planning
          </p>

        </div>

      </footer>

    </main>
  );
}