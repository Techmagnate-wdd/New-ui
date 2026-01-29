// src/services/airtable.js
import axios from "axios";

const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || "app2OgbrWiCyoo9iV";
const AIRTABLE_TOKEN = process.env.REACT_APP_AIRTABLE_PERSONAL_TOKEN || "pat8C4yWP1cARdZVA.f22fb26c9a77e75b85753c73f59e24be00c28d1fd729979f0ae8ff8de65efb30";

// For now you will hardcode table IDs
// Later you can pass tableId dynamically
export const listAirtableRecords = async (tableId) => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;

    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    });
};
