package controllers

import (
	"UserService/api_contracts"
	"UserService/errors"
	"UserService/helpers"
	"UserService/services"
	"net/http"

	"github.com/sarulabs/di"
)

var Authenticate = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	var request *api_contracts.LoginRequest
	err := helpers.ReadJSONBody(r, &request)

	if errors.Handle(err, w) {
		return
	}

	err = request.Validate()
	if errors.Handle(err, w) {
		return
	}

	authenticationService := di.Get(r, services.AuthService).(*services.AuthenticationService)
	authenticatedUser, err := authenticationService.Auth(request.Email, request.Password)
	if errors.Handle(err, w) {
		return
	}

	helpers.JSONResponse(w, 200, authenticatedUser)
})
