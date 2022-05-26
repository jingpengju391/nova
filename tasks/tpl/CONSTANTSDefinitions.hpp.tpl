#ifndef CONSTANTSDefinitions_hpp
#define CONSTANTSDefinitions_hpp
#ifdef _MODEL_CHINALIFE_LIAB
namespace CHINALIFELIAB{
class GlobalConstants {
      
  public:
      
      class DataFields {
          
      public:
          
          DataFields();
          
          <% workspace.globalConstants.DataFields.forEach(el => { %>
            const SuperString &<%- el.name %>;
          <% }) %>
          
         
      };
      
      static DataFields DATA_FIELDS;
      
      class DefaultFields {
        
      public:
          
          DefaultFields();
          
          <% workspace.globalConstants.DefaultFields.forEach(el => { %>
            const SuperString &<%- el.name %>;
          <% }) %>
          
      };
      
      static DefaultFields DEFAULT_FIELDS;
      
      class AssumptionFields {                       
        
      public:
          
          AssumptionFields();

          <% workspace.globalConstants.AssumptionFields.forEach(el => { %>
            const SuperString &<%- el.name %>;
          <% }) %>
      };
  
      static AssumptionFields ASSUMPTION_FIELDS;     
  
      class ProjectConstants {                        
  
      public:
          ProjectConstants();
          
          <% workspace.globalConstants.ProjectConstants.forEach(el => { %>
            const SuperString &<%- el.name %>;
          <% }) %>
      };
  
      static ProjectConstants PROJECT_CONSTANTS;      
  
      static ExternalConstantReader EXTERNAL_CONSTANTS;   
  };
}
#endif
#endif