<% var calcPref = "_calc_" %>
<% var convertPref = "_convert_" %>
<% var copyPref = "_copySize_" %>
<% var rebasePeriodPref = "_rebasePeriod_" %>
<% var rebaseBasePref = "_rebaseBase_" %>
<% var channelPref = "_channel_" %>
<% var blockSumPref = "_blockSum_" %>
<% var blocks = new Array() %>
<% function generateChildBlock(blocks, block) {%>
<% block.children.forEach(c => { %>
    <% workspace.wholeBlocks.forEach(b => { %>
    <% if (c.name === b.name){ %>
        <% blocks[blocks.length] = b; %>
        <% generateChildBlock(blocks, b);%>
    <% } %>
    <% }) %>
<% }) %>
<% } %>
<% function fixNumberFormula(formulaStr) {%>
<% const formulaLines = formulaStr.trim().split("\n") %>
<% let noOfLines = formulaLines.length %>
<% if ( noOfLines === 0 ) {%>
<% return "return 0;" %>
<% } %>
<% let lastLine = formulaLines[noOfLines - 1] %>
<% while (lastLine.length === 0 && noOfLines > 1) { %>
<% --noOfLines %>
<% lastLine = formulaLines[noOfLines - 1] %>
<% } %>
<% if ( lastLine.indexOf("return") === -1 ) {%>
<% return formulaStr + "\nreturn 0;" %>
<% } %>
<% return formulaStr %>
<% } %>
<% function fixStringFormula(formulaStr) {%>
<% const formulaLines = formulaStr.trim().split("\n") %>
<% let noOfLines = formulaLines.length %>
<% if ( noOfLines === 0 ) {%>
<% return 'return "";' %>
<% } %>
<% let lastLine = formulaLines[noOfLines - 1] %>
<% while (lastLine.length === 0 && noOfLines > 1) { %>
<% --noOfLines %>
<% lastLine = formulaLines[noOfLines - 1] %>
<% } %>
<% if ( lastLine.indexOf("return") === -1 ) {%>
<% return formulaStr + '\nreturn "";' %>
<% } %>
<% return formulaStr %>
<% } %>
<% function fixPointerFormula(formulaStr) {%>
<% const formulaLines = formulaStr.trim().split("\n") %>
<% let noOfLines = formulaLines.length %>
<% if ( noOfLines === 0 ) {%>
<% return 'return *this;' %>
<% } %>
<% let lastLine = formulaLines[noOfLines - 1] %>
<% while (lastLine.length === 0 && noOfLines > 1) { %>
<% --noOfLines %>
<% lastLine = formulaLines[noOfLines - 1] %>
<% } %>
<% if ( lastLine.indexOf("return") === -1 ) {%>
<% return formulaStr + '\nreturn *this;' %>
<% } %>
<% return formulaStr %>
<% } %>
<% function getLinkSeperators(thisBlock, l) {%>
<% var lTarget = "" %>
<% var targetBlock = null %>
<% var linkSeperators = [] %>
<% lTarget = l.target.maskName %>
<% const targetBlockIndex = workspace.wholeBlocks.findIndex(b => b.name === l.target.maskName)%>
<% if(targetBlockIndex > -1) {%>
<% targetBlock = workspace.wholeBlocks[targetBlockIndex]%>
<% }%>
<% if(targetBlock){%>
<% l.transmit.forEach(s => { %>
<% const targetVariableIndex = targetBlock.variables.findIndex(v => v.id === s.label)%>
<% if(targetVariableIndex > -1){%>
<%     const targetVariable = targetBlock.variables[targetVariableIndex]%>
<%     let currentSepFormula = "_setClusterValue(" + lTarget + "::VARIABLES." + targetVariable.name%>
<%     if(s.type === 1) {%>
<%         if(targetVariable.type.toLowerCase() === "integer"||targetVariable.type.toLowerCase() === "float"||targetVariable.type.toLowerCase() === "long"||targetVariable.type.toLowerCase() === "double"||targetVariable.type.toLowerCase() === "long long"){%>
<%             currentSepFormula = currentSepFormula + " ," + s.value%>
<%         } else {%>
<%             currentSepFormula = currentSepFormula + " ," + '"' + s.value + '"'%>
<%         }%>
<%         linkSeperators.push(currentSepFormula)%>
<%     } else {%>
<%         const currentVariableIndex = thisBlock.variables.findIndex(v => v.id === s.value)%>
<%         if(currentVariableIndex > -1) {%>
<%         const currentVariable = thisBlock.variables[currentVariableIndex]%>
<%         if(currentVariable.type === targetVariable.type) {%>
<%             currentSepFormula = currentSepFormula + " ," + currentVariable.name%>
<%             linkSeperators.push(currentSepFormula)%>
<%         }%>
<%        }%>
<%     }%>
<% }%>
<% }) %>
<%}%>
<%return linkSeperators.join(", ")%>
<% } %>
<% workspace.blocks.forEach(block => { %>
<% blocks[blocks.length] = block; %>
<% }) %>
<% workspace.blocks.forEach(block => { %>
<% if (!block.parent.id || !block.parent.name) { %>
<% generateChildBlock(blocks, block)%>
//#include "<%- block.name %>Definitions.hpp"
<% } %>
<% }) %>
<%# header %>
#include "ALLBLOCKSDefinitions.hpp"

using namespace std;
namespace <%- workspace.modelName %>{

using namespace <%- workspace.modelName %>;

<% blocks.forEach(block => { %>

    <% if (!block.parent.id || !block.parent.name) { %>
    <% var baseBlock = "Block" %>
    <% var maskPrefix = "" %>
    <% } else { %>
    <% var baseBlock = block.parent.name %>
    <% var maskPrefix = block.parent.name + "::" %>
    <% } %>
    <% var fullName = maskPrefix + block.name %>
    //unique name of block class
    const SuperString <%- fullName %>::NAME = getRealClassName(typeid(<%- fullName %>).name());

    //name sets for variables / series / links direct belonging to the class
    const <%- fullName %>::Variables <%- fullName %>::VARIABLES = <%- fullName %>::Variables();
    const <%- fullName %>::Series <%- fullName %>::SERIES = <%- fullName %>::Series();
    const <%- fullName %>::Links <%- fullName %>::LINKS = <%- fullName %>::Links();

    //the profile object registers the block to the projection and hold its creator which is the function to create an instance and a map of blocks inheriting it.
    <%- fullName %>::Profile<<%- fullName %>> <%- fullName %>::PROFILE = <%- fullName %>::Profile<<%- fullName %>>(&<%- fullName %>::Profile<<%- fullName %>>::create, true);

    //class constructor of the profile above
    template <typename ME>
    <%- fullName %>::Profile<ME>::Profile(Block *(*blockFunc)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &), const bool &direct):
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
    Block *<%- fullName %>::Profile<ME>::create(const BlockCluster *const &cluster, const Block *const &ownerBlock, const bool &isDeep, const long &level, GeneralMemoryChunk *const &chunk) {

        <% if (block.name === "BASEMASK") { %>
            return cluster ? (new (chunk->data()) ME(cluster, chunk)) : (new (chunk->data()) ME(ownerBlock, isDeep, level, chunk));
        <% } else if (!block.parent.id || !block.parent.name) { %>
            return cluster ? (new (chunk->data()) <%- block.name %>(cluster, chunk)) : (new (chunk->data()) <%- block.name %>(ownerBlock, isDeep, level, chunk));
        <% } else { %>
            return cluster ? (new (chunk->data()) ME(cluster, chunk)) : (new (chunk->data()) ME(ownerBlock, isDeep, level, chunk));
        <% } %>
    }

    //initialization of names of variables directly belonging to the block
    //one segment for each variable
    <%- fullName %>::Variables::Variables():
    <% block.variables.forEach(v => { %>
        <% if (v.isDirect) { %>
            <%- v.name %> ("<%- v.name %>"),
        <% } %>
    <% }) %>
    <%- baseBlock %>::Variables()
    {}

    //initialization of names of series directly belonging to the block
    //one segment for each series
    <%- fullName %>::Series::Series():
    <% block.series.forEach(s => { %>
        <% if (s.isDirect) { %>
            <%- s.name %> ("<%- s.name %>"),
        <% } %>
    <% }) %>
    <%- baseBlock %>::Series()
    {}

    //initialization of names of links directly belonging to the block
    //one segment for each link
    <%- fullName %>::Links::Links():
    <% block.links.forEach(l => { %>
        <% if (l.isDirect) { %>
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
                <% if (v.source === "calculated" || v.source ===  "codeIndexFormula") { %>
                    <% convertTarget = "Calculated" %>
                    <% convertPara = "&" + fullName + "::" + calcPref + v.name %>
                <% } else if (v.source === "data") { %>
                    <% convertTarget = "DataRaw" %>
                    <% convertPara = "\"" + v.linkage + "\""%>
                <% } else if (v.source === "assumption") { %>
                    <% convertTarget = "Assumption" %>
                    <% convertPara = "\"" + v.linkage + "\"" %>
                <% } else { %>
                    <% convertTarget = "Default" %>
                    <% convertPara = "\"" + v.linkage + "\"" %>
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
                <% if (s.source === "calculated" || s.source ===  "codeIndexFormula") { %>
                    <% convertTarget = "Normal" %>
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
            <% } %>
        <% }) %>
        <% block.series.forEach(s => { %>


                <% if(s.isAutoSum === true && s.autoSumLevel != null) {%>
            <%- s.name %>.setAutoSumLevel(<%- s.autoSumLevel %>);
                <%}%>

        <% }) %>
        <%# convert links %>
        <% block.links.forEach(l => { %>
            <% if (l.isDirect === false && l.isDefining === true) { %>
                <% if (l.source === "calculated" || l.source ===  "codeIndexFormula") { %>
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
            <% if (l.target.maskName.length > 0) { %>  
            <%- l.name %>._convertTo<%- convertTarget %> (<%- convertPara %>);
            <% } %>
            <% } %>
        <% }) %>
    }



    <% if (!block.parent.id || !block.parent.name) { %>
        <% var baseBlock = "Block" %>
        <% var maskPrefix = "" %>
    <% } else { %>
        <% var baseBlock = block.parent.name %>
        <% var maskPrefix = block.parent.name + "::" %>
    <% } %>
    <% var fullName = maskPrefix + block.name %>

    void <%- fullName %>::_runAfterInitialization() const{
        <% block.initializeFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% })%>
    };
    void <%- fullName %>::_runAfterFinalization() const{
        <% if(block.finalizeFormula) {%>
        <% block.finalizeFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% })%>
        <% } %>
    };
    void <%- fullName %>::_runAfterRebase() const{
        <% if (block.rebaseNeeded === 'yes') { %>
        <% block.runAfterRebaseFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% })%>
        <% } %>
    };
    <%# variable formula %>
    <% block.variables.forEach(v => { %>
    <% if (v.isDefining === true) { %>
        <% var vReturn = "" %>
        <% var vFormulaPref = "" %>
        <% var vArgumentList = "" %>
        <% var isNumerical = false %>
        <%# variable Type %>
        <% if (v.type.toLowerCase() === "integer" || v.type.toLowerCase() === "long") { %>
            <% isNumerical = true %>
          <% vReturn = "long" %>
        <% } else if (v.type.toLowerCase() === "double" || v.type.toLowerCase() === "float") { %>
            <% isNumerical = true %>
          <% vReturn = "double" %>
        <% } else if (v.type.toLowerCase() === "string") { %>
          <% vReturn = "std::string" %>
        <% } else if (v.type.toLowerCase() === "table") { %>
          <% vReturn = "std::string" %>
        <% } %>
        <%# formula %>
        <% if (v.source === "calculated" || v.source ===  "codeIndexFormula") { %>
          <% vFormulaPref = calcPref %>
          <% vArgumentList = "const VariableBase &me" %>
        <% } else if (v.source === "dataConverted") { %>
          <% vFormulaPref = convertPref %>
          <% vArgumentList = "const DataRollRecord &record, const VariableBase &me" %>
        <% } %>

        <% if (v.source === "calculated" || v.source === "dataConverted" || v.source ===  "codeIndexFormula") { %>
    <%- vReturn %> <%- fullName %>::<%- vFormulaPref %><%- v.name %>(<%- vArgumentList %>)const{
        <% let fixedFormula = "" %>
        <% if (isNumerical) { %>
        <% fixedFormula = fixNumberFormula(v.calcFormula) %>
        <% } else { %>
        <% fixedFormula = fixStringFormula(v.calcFormula) %>
        <% } %>
                <% fixedFormula.split("\n").forEach(line => { %>
    <%- line %>
            <% }) %>
    }
        <% } %>
    <% } %>
    <% }) %>
    <%# variable copySize formula %>
    <% block.variables.forEach(v => { %>
        <% if (v.copyType === "dynamic") { %>
          <% if (v.type.toLowerCase() === "table") { %>
    long <%- fullName %>::<%- copyPref %><%- v.name %>(const TableBase &me) const{
          <% } else { %>
    long <%- fullName %>::<%- copyPref %><%- v.name %>(const VariableBase &me) const{
          <% }%>
                <% const fixedFormula = fixNumberFormula(v.copyFormula) %>
                <% fixedFormula.split("\n").forEach(line => { %>
    <%- line %>
                <% }) %>
    }
        <% } %>
    <% }) %>
    <%# series formula %>
    <% block.series.forEach(s => { %>
    <% if (s.isDefining === true) { %>
        <% if (s.source === "calculated" || s.source ===  "codeIndexFormula") { %>
    double <%- fullName %>::<%- calcPref %><%- s.name %> (const long &t, const SeriesBase &me) const{
        <% const fixedFormula = fixNumberFormula(s.calcFormula) %>
        <% fixedFormula.split("\n").forEach(line => { %>
        <%-line %>
        <% }) %>
    }
        <% }else if (s.source === "channel") { %>
    const SeriesBase& <%- fullName %>::<%- calcPref %><%- s.name %> () const{
        <% var channelFormual = "return " %>
        <% s.channelSeries.links.forEach(l => { %>
        <%channelFormual += (l + "->")%>
        <% }) %>
        channelFormual += s.channelSeries.series;
        <%- channelFormual %>;
        <% } %>
    <% } %>
    <% }) %>
    <%# series blockSum function todo? %>
    <%# series channel functioin todo? %>
    <%# series copySize formula %>
    <% block.series.forEach(s => { %>
    <% if (s.copyType === "dynamic") { %>
    long <%- fullName %>::<%- copyPref %><%- s.name %> (const SeriesBase &me) const{
        <% const fixedFormula = fixNumberFormula(s.copyFormula) %>
        <% fixedFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <% }) %>
    <%# series rebase  formula %>
    <% block.series.forEach(s => { %>
    <% if (s.rebaseNeeded === true) { %>
    long <%- fullName %>::<%- rebasePeriodPref %><%- s.name %> (const SeriesBase &me) const{
        <% s.rebasePeriodFunctionLines.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    const SeriesBase &<%- fullName %>::<%- rebaseBasePref %><%- s.name %> (const SeriesBase &me) const{
        <% s.rebaseBaseFunctionLines.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <% }) %>
    <%# link formula %>
    <% block.links.forEach(l => { %>
    <% if (l.target.maskName.length > 0) { %> 
    <% if (l.isDefining === true) { %>
    <% if (l.source === "calculated"|| l.source ===  "codeIndexFormula") { %>
    const Block &<%- fullName %>::<%- calcPref %><%- l.name %> (BlockFamily &linkBlock, const LinkBase &me) const{
        <% l.calcFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <% } %>
    <% } %>
    <% }) %>
    <%# link copySize formula %>
    <% block.links.forEach(l => { %>
    <% if (l.copyType === "dynamic") { %>
    long <%- fullName %>::<%- copyPref %><%- l.name %> (const LinkBase &me) const{
        <% l.copySizeFunctionLines.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <% }) %>
    <%# block copy formula %>
    <% if (block.copyType === "dynamic") { %>
    long <%- fullName %>::_maxCopySize() const{
        <% const fixedFormula = fixNumberFormula(block.copySizeFunctionLines) %>
        <% fixedFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <%# block rebase formula %>
    <% if (block.rebaseNeeded === 'yes') { %>
    const Block &<%- fullName %>::_getRebaseBaseBlock() const{
        <% const fixedFormula = fixPointerFormula(block.rebaseBaseFunctionLines) %>
        <% fixedFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% } %>
    <%# method formula %>
    <% if(block.methods != undefined){%>
    <% block.methods.forEach(m => { %>
    <% var mReturn = "" %>

    <% var mArgumentList = m.parameter %>
    <% if (!m.returnType) { %>
        <% mReturn = "void" %>
    <% } else if (m.returnType.length === 0) { %>
        <% mReturn = "void" %>
    <% } else if (m.returnType.toLowerCase() === "integer" || m.returnType.toLowerCase() === "long" || m.returnType.toLowerCase() === "int") { %>
        <% mReturn = "long" %>
    <% } else if (m.returnType.toLowerCase() === "double" || m.returnType.toLowerCase() === "float") { %>
        <% mReturn = "double" %>
    <% } else if (m.returnType.toLowerCase() === "string") { %>
        <% mReturn = "std::string" %>
    <% } else if (m.returnType.toLowerCase() === "table") { %>
        <% mReturn = "std::string" %>
    <% } else { %>
        <% mReturn = m.returnType %>
    <% } %>
    <% var mFormula = mReturn + " " + fullName + "::" + m.name + "(" + mArgumentList +") const" %>
    <% if (m.isDefining === true) { %>
    <%- mFormula%>{
        <% m.calcFormula.split("\n").forEach(line => { %>
        <%- line %>
        <% }) %>
    }
    <% }%>
    <% }) %>
    <% }%>
<% }) %>



<%# footer %>
}

