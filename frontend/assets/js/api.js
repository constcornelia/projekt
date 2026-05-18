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
           if (!response.ok) {
               throw new Error (response.status);
           }
           let data = await response.json();
           return data;

       } catch (error) {
        section.innerHTML = "Couldn't reach data. Please try again! " + error;
       }
   }

   async postRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "POST",
               headers: {
                "Authorization": "Bearer 67",
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
           section.innerHTML = "Couldn't post product " + error;
       }
   }

   async patchRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "PATCH",
               headers: {
                 "Authorization": "Bearer 67",
                "Content-Type": "application/json"
               },
               body: JSON.stringify(body)
           });


           let response = await fetch (request);


           let data = null;


           if (response.status !== 204) {
               data = await response.json();
               return data;
           }


           alert("Successfully edited!");


       } catch (error) {
           section.innerHTML = "Couldn't edit product " + error;
       }
   }

   async deleteRequest (endpoint) {
       try {
           let request = new Request (url + endpoint, {
               method: "DELETE",
               headers: {
                 "Authorization": "Bearer 67"
               }
           });


           let response = await fetch (request);


           let data = null;


           if (response.status !== 204) {
               data = await response.json();
               return data;
           }


           alert("Successfully deleted!");
          
       } catch (error) {
           section.innerHTML = "Couldn't delete product " + error;
       }
   }
}




