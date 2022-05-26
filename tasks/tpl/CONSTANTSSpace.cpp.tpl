#ifdef _MODEL_CHINALIFE_LIAB
namespace CHINALIFELIAB{

using namespace CHINALIFELIAB;

GlobalConstants::DataFields::DataFields():
    <% workspace.globalConstants.DataFields.forEach((el, index) => { %>
        <% if (index === workspace.globalConstants.DataFields.length - 1) { %>
            <%- el.name %>(getSuperString("<%- el.name %>"));
        <% } else { %>   
            <%- el.name %>(getSuperString("<%- el.name %>")),
        <% } %>
    <% }) %>

GlobalConstants::DefaultFields::DefaultFields():
<% workspace.globalConstants.DefaultFields.forEach((el, index) => { %>
    <% if (index === workspace.globalConstants.DefaultFields.length - 1) { %>
        <%- el.name %>(getSuperString("<%- el.name %>"));
    <% } else { %>   
        <%- el.name %>(getSuperString("<%- el.name %>")),
    <% } %>
<% }) %>

GlobalConstants::DataFields GlobalConstants::DATA_FIELDS = GlobalConstants::DataFields();
GlobalConstants::DefaultFields GlobalConstants::DEFAULT_FIELDS = GlobalConstants::DefaultFields();

GlobalConstants::AssumptionFields::AssumptionFields() { } 
GlobalConstants::ProjectConstants::ProjectConstants() { }
GlobalConstants::AssumptionFields GlobalConstants::ASSUMPTION_FIELDS = GlobalConstants::AssumptionFields();
GlobalConstants::ProjectConstants GlobalConstants::PROJECT_CONSTANTS = GlobalConstants::ProjectConstants();  
ExternalConstantReader GlobalConstants::EXTERNAL_CONSTANTS = ExternalConstantReader();

}
#endif