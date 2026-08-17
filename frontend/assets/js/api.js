const url = "http://localhost:8000"; 

class API {
   async getRequest(endpoint) {
       try {
           let request = new Request (url + endpoint, {
               method: "GET",
               headers: {
                "Accept": "application/json"
               }
           });
           let response = await fetch (request);
           if (response.status === 401) {
               window.location.href = "/login";
               return null;
           }
           if (!response.ok) {
            throw new Error (response.status);
           }
           let data = await response.json();
           return data;
       } catch (error) {
            throw error;
       }
   }

   async postRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "POST",
               headers: {
                "Content-Type": "application/json"
               },
               body: JSON.stringify(body)
           });
           let response = await fetch (request);
           let data = null;
           if (response.status !== 201) {
               data = await response.json();
               return data;
           }
           alert("Successfully posted!");
       } catch (error) {
            throw error;
       }
   }

   async patchRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "PATCH",
               body: JSON.stringify(body)
           });
           let response = await fetch (request);
           if (!response.status) {
               let data = await response.json();
               console.log(data);
               return null;
            }
            let data = await response.json();
            return data;
       } catch (error) {
            throw error;
       }
   }

    async deleteRequest(endpoint) {
        try {
            let request = new Request(url + endpoint, {
                method: "DELETE",
            });
            let response = await fetch(request);
            return response;
        } catch (error) {
            throw error;
        }
    }
}
