const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const config = getConfig();
info("Template rendering start")
getTemplateFiles().forEach(renderTemplate);
info("Template rendering complete")

function getConfig() {
    const environmentVariableMap = {
        discordToken: "DISCORD_TOKEN",
        awsAccountId: "AWS_ACCOUNT_ID",
        region: "AWS_DEFAULT_REGION",
        dockerImageTag: "DOCKER_IMAGE_TAG",
        steamApiKey: "STEAM_API_KEY",
        battlenetClientKey: "BATTLENET_CLIENT_KEY",
        battlenetClientSecret: "BATTLENET_CLIENT_SECRET"
    };

    (function assertExpectedEnvironementVariables() {
        const errors = Object.keys(environmentVariableMap).reduce((errors, key) => {
            const environmentVariable = environmentVariableMap[key];
            if (process.env[environmentVariable] === undefined) {
                errors.push(`The ${environmentVariable} environment variable must be set`)
            }
            return errors;
        }, []);

        if (errors.length > 0) {
            error(errors.join(" | "));
        }
    })();

    return (function buildConfigFromEnvironmentVariables() {
        return Object.keys(environmentVariableMap).reduce((config, key) => {
            config[key] = process.env[environmentVariableMap[key]];
            return config;
        }, {});
    })();
}


function getTemplateFiles() {
    return [
        "pull-docker-image.template",
        "creds.yaml.template",
        "application-start.template"
    ];
}

function renderTemplate(filename) {
    const TEMPLATE_DIRECTORY = "templates";
    try {
        const content = fs.readFileSync(path.join(TEMPLATE_DIRECTORY, filename), "utf8");
        const renderedContent = Handlebars.compile(content)(config);
        const renderedFilename = stripTemplateSuffix(filename);
        fs.writeFileSync(renderedFilename, renderedContent);
    } catch (e) {
        error(e);
    }
}

function stripTemplateSuffix(filename) {
    const index = filename.indexOf(".template");
    return filename.slice(0, index);
}

function info(msg) {
    console.log(`[INFO] ${msg}`);
}

function error(msg) {
    console.error(`[ERROR] ${msg}`);
    process.exit(1);
}