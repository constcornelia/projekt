const url = "http://localhost:8000/";


let authorization = {
   "Authorization": "Bearer 67"
}


let accept = {
   "Accept": "application/json"
};


let contentType = {
   "Content-Type": "application/json"
};


class API {
   async getRequest(endpoint) {
       try {
           let request = new Request (url + endpoint, {
               method: "GET",
               headers: {
                   // authorization,
                   accept
               }
           });
      
           let response = await fetch (request);
      
           if(!response.ok) {
               throw new Error (response.status);
           }
      
           let data = await response.json();


           return data;


       } catch (error) {
           main.innerHTML = "Couldn't reach data. Please try again! " + error;
       }
   }


   async postRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "POST",
               headers: {
                   authorization,
                   contentType
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
           main.innerHTML = "Couldn't post product " + error;
       }
   }


   async patchRequest (endpoint, body) {
       try {
           let request = new Request (url + endpoint, {
               method: "PATCH",
               headers: {
                   authorization,
                   contentType
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
           main.innerHTML = "Couldn't edit product " + error;
       }
   }


   async deleteRequest (endpoint) {
       try {
           let request = new Request (url + endpoint, {
               method: "DELETE",
               headers: {
                   authorization
               },
           });


           let response = await fetch (request);


           let data = null;


           if (response.status !== 204) {
               data = await response.json();
               return data;
           }


           alert("Successfully deleted!");
          
       } catch (error) {
           main.innerHTML = "Couldn't delete product " + error;
       }
   }
}




