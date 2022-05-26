#include "Beam.hpp"

  <% workspace.blocks.forEach(b => { %>
  <% if (!b.parent.id || !b.parent.name) { %>
  #include "<%- b.name %>Definitions.hpp" 
  <%}%>
  <% }) %>
