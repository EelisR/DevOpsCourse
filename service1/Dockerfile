FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build-env
WORKDIR /service1

COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /service1
COPY --from=build-env /service1/out .

COPY ../wait-for-it/wait-for-it.sh ./
RUN ./wait-for-it.sh ${MQ_ADDRESS}

ENTRYPOINT ["dotnet", "service1.dll"]
