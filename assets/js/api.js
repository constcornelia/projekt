const url = "http://localhost:8000/";

let accept = { "Accept": "application/json" };
let contentType = { "Content-Type": "application/json" };

// Test om det går att göra alla requests med en metod
class API {
    async requests(method, body, enpoint, msg) {
        let options; 

        if (method == "GET") options = { method: method, headers: { authorization, accept }};
        if (method == "POST" || method == "PATCH") options = { method: method, headers: { authorization, contentType }, body: JSON.stringify(body) };
        if (method == "DELETE") options = { method: method, headers: { authorization }};

        try {
            const request = new Request(url + enpoint, { options });
            const response = await fetch(request);
            if (!response.ok) throw new Error(response.status);
    
            let data = await response.json();
            // Använd msg-argummentet för att potentiellt meddela användare specifikt om error eller success
        } catch(error) {}
    }

/*
    // Method for all get-requests
     async getRequest(endpoint) {
        try {
            const request = new Request(url + endpoint, { headers });
            const response = await fetch(request);
            if (!response.ok) throw new Error(response.status);

            let data = await response.json();
            return data;

        } catch(error) {
            // Handle error on frontend
        }
    }

    // Method for all post-requests
    async postRequest(endpoint, body) { // Get body from frontend
        try {
            const request = new Request(url + endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            const response = await fetch(request);
            if (!response.ok) throw new Error(response.status);
            // Maybe an alert message to communicate that it was successfull to user

            let data = await response.json();
            return data; // Maybe needs to me made sure if it's the right response.status
        } catch(error) {}
    }

    // Method for all patch-requests
    async patchRequest(endpoint, body) {
        try {
            const request = new Request(url + endpoint, {
                method: "PATCH",
                headers,
                body: JSON.stringify(body)
            });
            const response = await fetch(request);
            if (!response.ok) throw new Error(response.status);

            let data = await response.json();
            return data; // Maybe needs to me made sure if it's the right response.status
        } catch(error) {}
    }

    // Method for all delete-requests
    async deleteRequest(enpoint) {} */
}