<% var calcPref = "_calc_" %>
<% var convertPref = "_convert_" %>
<% var copyPref = "_copySize_" %>
<% var rebasePeriodPref = "_rebasePeriod_" %>
<% var rebaseBasePref = "_rebaseBase_" %>
<% var channelPref = "_channel_" %>
<% var blockSumPref = "_blockSum_" %>
<% var blocks = new Array() %>
<% async function generateChildBlock(blocks, block) {%>
<% block.children.forEach(c => { %>
    <% workspace.wholeBlocks.forEach(b => { %>
    <% if (c.name === b.name){ %>
        <% blocks[blocks.length] = b; %>
        <% generateChildBlock(blocks, b);%>
    <% } %>
    <% }) %>
<% }) %>
<% } %>
<% workspace.blocks.forEach(block => { %>
<% blocks[blocks.length] = block; %>
<% }) %>
<% workspace.blocks.forEach(block => { %>
<% if (block.parent === null || block.parent.name === "") { %>
<% generateChildBlock(blocks, block)%>
<% if (block.name === "CFBENEFITMASK") { %>
<% } %>
<% } %>
<% }) %>
<%# header %>
<% workspace.blocks[0].links.forEach(l => { %>
#include "<%- l.target.maskName %>Definitions.hpp" 
<% }) %>

namespace <%- workspace.modelName %>{

using namespace <%- workspace.modelName %>;

<% blocks.forEach(block => { %> 
    <% if (block.parent === null || block.parent.name === "") { %>
    <% var baseBlock = "Block" %> 
    <% var maskPrefix = "" %> 
    <% } else { %>
    <% var baseBlock = block.parent.name %>
    <% var maskPrefix = block.parent.name + "::" %>
    <% } %> 
    <% var fullName = maskPrefix + block.name %>
    //unique name of block class
    const SuperString &<%- fullName %>::NAME = getRealClassName(typeid(<%- fullName %>).name());

    //name sets for variables / series / links direct belonging to the class
    const <%- fullName %>::Variables <%- fullName %>::VARIABLES = <%- fullName %>::Variables();
    const <%- fullName %>::Series <%- fullName %>::SERIES = <%- fullName %>::Series();
    const <%- fullName %>::Links <%- fullName %>::LINKS = <%- fullName %>::Links();

    //the profile object registers the block to the projection and hold its creator which is the function to create an instance and a map of blocks inheriting it.
    <%- fullName %>::Profile<<%- fullName %>> <%- fullName %>::PROFILE = <%- fullName %>::Profile<<%- fullName %>>(&<%- fullName %>::Profile<<%- fullName %>>::create, true);

    //class constructor of the profile above
    template <typename ME>
    <%- fullName %>::Profile<ME>::Profile(Block *(*blockFunc)(const BlockCluster *const &, const Block *const &, const bool &, const int &, GeneralMemoryChunk *const &), const bool &direct):
    <%- baseBlock %>::Profile<<%- baseBlock %>>(blockFunc, false) {
        
        if(direct) {
            
            this->_navigator = this->addNavigator(ME::NAME, sizeof(ME), this->_blockFunc);
            
            this->registerToProjection(this->_navigator);
            
            std::cout << "block registered: [" << this->_navigator->blockName << "]" << std::endl;
        }
    }

    //function that registers the block to the projection and the base block, i.e. mask, it inherits
    template <typename ME>
    void <%- fullName %>::Profile<ME>::registerToProjection(Navigator *const &navigator) {
        
        this->linkNavigator<ME>(navigator);
        this-><%- baseBlock %>::Profile<<%- baseBlock %>>::registerToProjection(navigator);
        
        if(ME::PROFILE._navigator) {
            ME::PROFILE._navigator->addChild(navigator);
        }
    }
    
    //function that will be used by projection to create an instance of the block
    template <typename ME>
    Block *<%- fullName %>::Profile<ME>::create(const BlockCluster *const &cluster, const Block *const &ownerBlock, const bool &isDeep, const int &level, GeneralMemoryChunk *const &chunk) {
        
        <% if (block.name === "BASEMASK") { %>
            return cluster ? (new (chunk->data()) ME(cluster, chunk)) : (new (chunk->data()) ME(ownerBlock, isDeep, level, chunk));
        <% } else if (block.parent === null || block.parent.name === "") { %>
            return cluster ? (new (chunk->data()) <%- block.name %>(cluster, chunk)) : (new (chunk->data()) <%- block.name %>(ownerBlock, isDeep, level, chunk));            
        <% } else { %>
            return cluster ? (new (chunk->data()) ME(cluster, chunk)) : (new (chunk->data()) ME(ownerBlock, isDeep, level, chunk));
        <% } %>
    }

    //initialization of names of variables directly belonging to the block
    //one segment for each variable
    <%- fullName %>::Variables::Variables():
    <% block.variables.forEach(v => { %>
        <% if (v.baseID === "") { %>
            <%- v.name %> ("<%- v.name %>"),
        <% } %>
    <% }) %>
    <%- baseBlock %>::Variables()
    {}

    //initialization of names of series directly belonging to the block
    //one segment for each series
    <%- fullName %>::Series::Series():
    <% block.series.forEach(s => { %>
        <% if (s.baseID === "") { %>
            <%- s.name %> ("<%- s.name %>"),
        <% } %>
    <% }) %>
    <%- baseBlock %>::Series()
    {}
    
    //initialization of names of links directly belonging to the block
    //one segment for each link
    <%- fullName %>::Links::Links():
    <% block.links.forEach(l => { %>
        <% if (l.baseID === "") { %>
            <%- l.name %> ("<%- l.name %>"),
        <% } %>
    <% }) %>
    <%- baseBlock %>::Links()
    {}
    
    //convert
    void <%- fullName %>::_convertItems () {
        <% var convertTarget="" %> 
        <% var convertPara="" %> 
        <%# convert variable %> 
        <% block.variables.forEach(v => { %>
            <% if (v.isDirect === false && v.isDefining === true) { %>
                <% if (v.source === "calculated") { %>
                    <% convertTarget = "Calculated" %>
                    <% convertPara = "&" + fullName + "::" + calcPref + v.name %>
                <% } else { %>
                    <% convertTarget = "Normal" %> 
                    <% convertPara = "&" + fullName + "::" + calcPref + v.name %>
                <% } %>
                <% if (v.copyType === "fixed") { %>
                    <% convertPara = convertPara + ", " +  v.copySize %> 
                <% } else if (v.copyType === "dynamic") { %>
                    <% convertPara = convertPara + ", &" + fullName + "::" + copyPref + v.name %> 
                <% } %>
                <%- v.name %>._convertTo<%- convertTarget %> (<%- convertPara %>);
            <% } %>
        <% }) %>
        <%# convert series %> 
        <% block.series.forEach(s => { %>
            <% if (s.isDirect === false && s.isDefining === true) { %>
                <% if (s.source === "Normal") { %>
                    <% convertTarget = "Calculated" %>
                    <% convertPara = "&" + fullName + "::" + calcPref + s.name %>
                <%} else if (s.source === "channel") { %>
                    <% convertTarget = "Channel" %>
                    <% convertPara = "&" + fullName + "::" + calcPref + s.name %>
                <% } else { %>
                    <% convertTarget = "Normal" %> 
                    <% convertPara =  "&" + fullName + "::" + calcPref + s.name %>
                <% } %>
                <% if (s.copyType === "fixed") { %>
                    <% convertPara = convertPara + ", " +  s.copySize %> 
                <% } else if (s.copyType === "dynamic") { %>
                    <% convertPara = convertPara + ", &" + fullName + "::" + copyPref + s.name %> 
                <% } %>
                <%- s.name %>._convertTo<%- convertTarget %> (<%- convertPara %>);
                <% if(s.isAutoSum === true && s.autoSumLevel != null) {%>
                <%- s.name %>.setAutoSumLevel(<%- s.autoSumLevel %>);
                <%}%>
            <% } %>
        <% }) %>
        <%# convert links %> 
        <% block.links.forEach(l => { %>
            <% if (l.isDirect === false && l.isDefining === true) { %>
                <% if (l.source === "calculated") { %>
                    <% convertTarget = "Calculated" %>
                    <% convertPara = fullName + "::" + calcPref + l.name %>
                <% } else { %>
                    <% convertTarget = "Normal" %> 
                    <% convertPara = fullName + "::" + calcPref + l.name %>
                <% } %>
                <% if (l.copyType === "fixed") { %>
                    <% convertPara = convertPara + ", " +  l.copySize %> 
                <% } else if (l.copyType === "dynamic") { %>
                    <% convertTarget = convertTarget + ", &" + fullName + "::" + copyPref + l.name %> 
                <% } %>
                <%- l.name %>._convertTo<%- convertTarget %> (<%- convertPara %>);
            <% } %>
        <% }) %>
    }
<% }) %> 

<%# footer %>
}
