var biznfcApp = angular.module("biznfcApp", []);

biznfcApp.controller('biznfcController', function ($scope, $http, $location) {
    $scope.name = "Rahul Rishikesh";

    function getQueryParams() {
        var params = {};
        var queryString = $location.absUrl().split('?')[1];
        if (queryString) {
            queryString.split('&').forEach(function (param) {
                var pair = param.split('=');
                params[pair[0]] = decodeURIComponent(pair[1]);
            });
        }
        return params;
    }

    var queryParams = getQueryParams();
    var requestData = {
        "url": queryParams.url
    };

    if (requestData.url) {
        $http.post('https://biznfc.net/getCardByUrl', requestData)
            .then(function (response) {
                if (response.data.success) {
                    $scope.cardDetails = response.data.results[0];
                } else {
                    console.error('API response unsuccessful:', response.data);
                }
            }, function (error) {
                console.error('Error occurred:', error);
            });
    } else {
        console.error('URL parameter is missing.');
    }

    $scope.shareOnWhatsApp = function () {
        if (queryParams.url) {
            const message = `Check out this Biznfc card: ${queryParams.url}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            console.error('URL parameter is missing.');
        }
    };
});
