<% var calcPref = "_calc_" %>
<% var convertPref = "_convert_" %>
<% var copyPref = "_copySize_" %>
<% var rebasePeriodPref = "_rebasePeriod_" %>
<% var rebaseBasePref = "_rebaseBase_" %>
<% var channelPref = "_channel_" %>
<% var blockSumPref = "_blockSum_" %>
<% var defaultField = "GlobalConstants::DEFAULT_FIELDS." %>
<% var assumpField = "GlobalConstants::ASSUMPTION_FIELDS." %>
<% var dataRawField = "GlobalConstants::DATA_FIELDS." %>
<% var defaultSource = "::Source::DEFAULT" %>
<% var assumpSource = "::Source::ASSUMPTION" %>
<% var dataRawSource = "::Source::DATA_RAW" %>
<% var passSource = "::Source::TRANSMIT" %>
<% var myBlockName = workspace.blocks[0].name %>
#ifndef <%- myBlockName %>Definitions_hpp
#define <%- myBlockName %>Definitions_hpp
#include "Beam.hpp"
#include "Definitions.hpp"
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
<% workspace.blocks.forEach(block => { %>
<% blocks[blocks.length] = block; %>
<% }) %>

<% workspace.blocks.forEach(block => { %>
<% if (!block.parent.id || !block.parent.name) { %>
<% generateChildBlock(blocks, block)%>
<% } %>
<% }) %>

using namespace std;

namespace <%- workspace.modelName %>{

<% if (!workspace.blocks[0].parent.id || !workspace.blocks[0].parent.name) { %>
<% workspace.wholeBlocks.forEach(b => { %>
<% if (!b.parent.id || !b.parent.name) { %>
  class <%- b.name %>;
<% } %>
<% }) %>
<% } %>

<% blocks.forEach(block => { %>
    <% if (!block.parent.id || !block.parent.name) { %>
    <% var baseBlock = "Block" %>
    <% var maskPrefix = "" %>
    class <%- block.name %> : public <%- baseBlock %>{
    <% } else { %>
    <% var baseBlock = block.parent.name %>
    <% var maskPrefix = block.parent.name + "::" %>
    class <%- baseBlock %> :: <%- block.name %> : public <%- baseBlock %>{
    <% } %>

      template <typename ME> friend class Profile;
      template <typename ME> friend class Block::Profile;
      template <typename M> friend class BlockLink;
        public:

          template <typename ME>
          class Profile: public <%- baseBlock %>::Profile<<%- baseBlock %>> {

            template <typename M> friend class BlockLink;
            friend class <%- maskPrefix %><%- block.name %>;

          public:

            Profile(Block *(*)(const BlockCluster *const &, const Block *const &, const bool &, const long &,  GeneralMemoryChunk *const &), const bool &);

          protected:

            virtual void registerToProjection(Navigator *const &) override;
            static Block *create(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &);
        };

        class Variables: public <%- baseBlock %>::Variables  {

          public:
          <% block.variables.forEach(v => { %>
            <% if (v.isDirect) { %>
            const SuperString <%- v.name %>;
            <% } %>
          <% }) %>
          <% if (block.variables.length === 0) { %>
          //no variables directly belong to this block
          <% } %>
          Variables();
        };

        class Series: public <%- baseBlock %>::Series {

          public:
          <% block.series.forEach(s => { %>
            <% if (s.isDirect) { %>
            const SuperString <%- s.name %>;
            <% } %>
          <% }) %>
          <% if (block.series.length === 0) { %>
            //no series directly belong to this block
          <% } %>
          Series();
        };

        class Links: public <%- baseBlock %>::Links  {
          public:
            <% block.links.forEach(l => { %>
              <% if (l.isDirect) { %>
            const SuperString <%- l.name %>;
              <% } %>
            <% }) %>
            <% if (block.links.length === 0) { %>
            //no links directly belong to this block
            <% } %>
            Links();
        };

        static const SuperString NAME;
        static Profile<<%- maskPrefix %><%- block.name %>> PROFILE;
        static const Variables VARIABLES;
        static const Series SERIES;
        static const Links LINKS;

        <% block.children.forEach(c => { %>
        class <%- c.name %>;
        <% }) %>

        inline const <%- maskPrefix %><%- block.name %> *operator -> () const
        {return this;}

        inline virtual const <%- maskPrefix %><%- block.name %> &_base() const override
        {return static_cast<const <%- maskPrefix %><%- block.name %> &>(this->Block::_base());}

        inline virtual const <%- maskPrefix %><%- block.name %> &_parent() const override
        {return static_cast<const <%- maskPrefix %><%- block.name %> &>(this->Block::_parent());}

        inline virtual const <%- maskPrefix %><%- block.name %> &operator () (const long &copyId) const override
        {return *static_cast<<%- maskPrefix %><%- block.name %> *>(this->_getCopy(copyId));}


        inline virtual <%- maskPrefix %><%- block.name %> * _getCopy(const long &copyId) const override {return (<%- maskPrefix %><%- block.name %> *)(this->Block::_getCopy(copyId));}


        <% block.variables.forEach(v => { %>
          <% if (v.isDirect) { %>
            <% var vType = "" %>
            <% var vOther = "" %>
            <%# variable Type %>

            <% if (v.type.toLowerCase() === "integer" || v.type.toLowerCase() === "long") { %>
              <% vType="IntegerVariable" %>
            <% } else if (v.type.toLowerCase() === "double" || v.type.toLowerCase() === "float") { %>
              <% vType="FloatVariable" %>
            <% } else if (v.type.toLowerCase() === "string") { %>
              <% vType="StringVariable" %>
            <% } else if (v.type.toLowerCase() === "table") { %>
              <% vType="Table" %>
            <% } %>

            <%# variable copy %>
            <% if (v.copyType === "fixed") { %>
              <% if (v.copySize === undefined) { %>
              <% vOther = ", 0" %>
              <% } else if (v.copySize < 0) { %>
              <% vOther = ", 0" %>
              <% } else { %>
              <% vOther = ", "+ v.copySize  %>
              <% } %>
            <% } else if (v.copyType === "dynamic") { %>
              <% vOther = ", &" + maskPrefix + block.name + "::" + copyPref + v.name %>
            <% } %>
            <%# variable source %>
            <% if (v.source.toLowerCase() === "calculated") { %>
              <% vOther = vOther + ", &"+maskPrefix+block.name+"::"+calcPref+v.name %>
            <% } else if (v.source.toLowerCase() === "default") { %>
              <% vOther = vOther + ", \""+ v.name + "\", VariableBase" + defaultSource %>
            <% } else if (v.source.toLowerCase() === "assumption") { %>
              <% vOther = vOther + ", \"" + v.name + "\", VariableBase" + assumpSource %>
            <% } else if (v.source.toLowerCase() === "dataraw" || v.source.toLowerCase() === "data") { %>
              <% vOther = vOther + ", \""+ block.id + "|" + v.name + "\", VariableBase" + dataRawSource %>
            <% } else if (v.source.toLowerCase() === "dataconverted") { %>
              <% vOther = vOther + ", &" + maskPrefix + block.name + "::" + convertPref + v.name %>
            <% } else { %>
            <% } %>
            <%# variable definition %>
        <%- vType %>Base <%- v.name %> = <%- vType %>Base(this, <%- maskPrefix %><%- block.name %>::VARIABLES.<%- v.name %><%- vOther %>);
          <% } %>
        <% }) %>


        <% block.series.forEach(s => { %>
          <% if (s.isDirect) { %>
            <% var sOther = "" %>
            <% if (s.source === "channel") { %>
            <% sOther = ", &" + maskPrefix + block.name + "::" + channelPref + s.name %>
            <% } else if (s.source === "blockSum") { %>
            <% sOther = ", &" + maskPrefix + block.name + "::" + blockSumPref + s.name %>
              <% if (s.copyType === "fixed") { %>
                <% if (s.copySize === undefined) { %>
                <% sOther = sOther + ", 0" %>
                <% } else if (s.copySize < 0) { %>
                <% sOther = sOther + ", 0" %>
                <% } else { %>
                <% sOther = sOther + ", "+ s.copySize  %>
                <% } %>
              <% } else if (s.copyType === "dynamic") { %>
                <% sOther = sOther + ", &" + maskPrefix + block.name + "::" + copyPref + s.name %>
              <% } %>
            <% } else if (s.source === "calculated" || s.source === "autoSum") { %>
              <% sOther = ", &" + maskPrefix + block.name + "::" + calcPref + s.name %>
              <%# copy %>
              <% if (s.copyType === "fixed") { %>
                <% sOther = sOther + ", "+ s.copySize  %>
              <% } else if (s.copyType === "dynamic") { %>
                <% sOther = sOther + ", &" + maskPrefix + block.name + "::" + copyPref + s.name %>
              <% } %>
              <%# autoSumLevel %>
              <% if (s.autoSumLevel > 0) { %>
                <% sOther = sOther + ", &" + s.autoSumLevel %>
              <% } %>
              <%# rebase %>
              <% if (s.rebaseNeeded === true) { %>
                <% sOther = sOther + ", &" + maskPrefix + block.name + "::" + rebasePeriodPref + s.name %>
                <% sOther = sOther + ", &" + maskPrefix + block.name + "::" + rebaseBasePref + s.name %>
              <% } %>
            <% } else { %>
            <% sOther = "" %>
            <% } %>
            <%# series definition %>
        SeriesBase <%- s.name %> = SeriesBase(this, <%- maskPrefix %><%- block.name %>::SERIES.<%- s.name %><%- sOther %>);
          <% } %>
        <% }) %>

        <% block.links.forEach(l => { %>
          <% if (l.isDirect) { %>
            <% var lTarget = "" %>
            <% var lOther = "" %>
            <%# targetType %>
            <% if (l.target.type === "block") { %>
            <% lTarget = l.target.maskName + "::" + l.target.blockName %>
            <% } else { %>
            <% lTarget = l.target.maskName %>
            <% } %>
            <%# copy %>
            <% if (l.copyType === "fixed") { %>
              <% lOther = lOther + ", "+ l.copySize  %>
            <% } else if (l.copyType === "dynamic") { %>
              <% lOther = lOther + ", &" + maskPrefix + block.name + "::" + copyPref + l.name %>
            <% } %>
            <%# source %>
            <% if (l.source.toLowerCase() === "calculated") { %>
              <% lOther = lOther + ", &"+maskPrefix+block.name+"::"+calcPref+l.name %>
            <% } else if (l.source.toLowerCase() === "default") { %>
              <% lOther = lOther + ", \""+ l.name + "\", LinkBase" + defaultSource %>
            <% } else if (l.source.toLowerCase() === "assumption") { %>
              <% lOther = lOther + ", \"" + l.name + "\", LinkBase" + assumpSource %>
            <% } else if (l.source === "transmit") { %>
              <% lOther = lOther + ", \"" + l.name + "\", LinkBase" + passSource %>
            <% } else { %>
            <% } %>
            <%# link definition %>
        <% if (l.target.maskName.length > 0) { %>    
        BlockLink<<%- lTarget %>> <%- l.name %>  = BlockLink<<%- lTarget %>>(this, <%- maskPrefix %><%- block.name %>::LINKS.<%- l.name %><%- lOther %>);
        <% } %>
          <% } %>
        <% }) %>
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
        <% } else  { %>
          <% mReturn = m.returnType %>
        <% } %>
        <% var mFormula = "virtual " + mReturn + " " + m.name + "(" + mArgumentList +") const" %>
        <% if (m.isDirect === true) { %>
          <% if (m.isDefining === true) { %>
          <%- mFormula%>;
          <% }else{ %>
          <%- mFormula%> = 0;
          <% } %>
        <% }else{ %>
          <% if (m.isDefining === true) { %>
        <%- mFormula%> override;
          <% }%>
        <% } %>
      <% }) %>
      <% } %>
      <%# block.definitions %>
      private:
      <%# variable formula %>
      <% block.variables.forEach(v => { %>
        <% if (v.isDefining === true) { %>
        <% var vReturn = "" %>
        <% var vFormulaPref = "" %>
        <% var vArgumentList = "" %>
        <%# variable Type %>
        <% if (v.type.toLowerCase() === "integer" || v.type.toLowerCase() === "long" || v.type.toLowerCase() === "int") { %>
          <% vReturn = "long" %>
        <% } else if (v.type.toLowerCase() === "double" || v.type.toLowerCase() === "float") { %>
          <% vReturn = "double" %>
        <% } else if (v.type.toLowerCase() === "string") { %>
          <% vReturn = "std::string" %>
        <% } else if (v.type.toLowerCase() === "table") { %>
          <% vReturn = "std::string" %>
        <% } %>
        <%# formula %>
        <% if (v.source === "calculated" || v.source ===  "codeIndexFormula") { %>
          <% vFormulaPref = calcPref %>
          <% vArgumentList = "const VariableBase &" %>
        <%- vReturn %> <%- vFormulaPref %><%- v.name %>(<%- vArgumentList %>)const;
        <% } else if (v.source === "dataConverted") { %>
          <% vFormulaPref = convertPref %>
          <% vArgumentList = "const DataRollRecord &, const VariableBase &" %>
        <%- vReturn %> <%- vFormulaPref %><%- v.name %>(<%- vArgumentList %>)const;
        <% } %>
      <% } %>
      <% }) %>
      <%# variable copySize formula %>
      <% block.variables.forEach(v => { %>
        <% if (v.copyType === "dynamic") { %>
          <% if (v.type.toLowerCase() === "table") { %>
      long <%- copyPref %><%- v.name %>(const TableBase &) const;
          <% } else { %>
      long <%- copyPref %><%- v.name %>(const VariableBase &) const;
          <% } %>
        <% } %>
      <% }) %>
      <%# series formula %>
      <% block.series.forEach(s => { %>
      <% if (s.isDefining === true) { %>
        <% if (s.source === "calculated" || s.source ===  "codeIndexFormula") { %>
        double <%- calcPref %><%- s.name %>(const long &, const SeriesBase &) const;
        <%} else if (s.source === "channel") { %>
        const SeriesBase& <%- calcPref %><%- s.name %>() const;
        <% } %>
      <% } %>
      <% }) %>
      <%# series blockSum function todo? %>
      <%# series channel functioin todo? %>
      <%# series copySize formula %>
      <% block.series.forEach(s => { %>
        <% if (s.copyType === "dynamic") { %>
        long <%- copyPref %><%- s.name %>(const SeriesBase &) const;
        <% } %>
      <% }) %>
      <%# series rebase  formula %>
      <% block.series.forEach(s => { %>
        <% if (s.rebaseNeeded === true) { %>
        int <%- rebasePeriodPref %><%- s.name %>(const SeriesBase &) const;
        const SeriesBase &<%- rebaseBasePref %><%- s.name %>(const SeriesBase &) const;
        <% } %>
      <% }) %>
      <%# link formula %>
      <% block.links.forEach(l => { %>
      <% if (l.isDefining === true) { %>
      <% if (l.source === "calculated" || l.source ===  "codeIndexFormula") { %>
        const Block &<%- calcPref %><%- l.name %>(BlockFamily &, const LinkBase &) const;
      <% } %>
      <% } %>
      <% }) %>

      <%# link copySize formula %>
      <% block.links.forEach(l => { %>
        <% if (l.copyType === "dynamic") { %>
        long <%- copyPref %><%- l.name %>(const LinkBase &) const;
        <% } %>
      <% }) %>



      protected:
        <%- block.name %>(const BlockCluster *const &cluster, GeneralMemoryChunk *const &chunk):
        <%- baseBlock %>(cluster, chunk) {
          this->_initialise();
        }

        <%- block.name %>(const Block *const &ownerBlock, const bool &isDeep, const long &level, GeneralMemoryChunk *const &chunk):
        <%- baseBlock %>(ownerBlock, isDeep, level, chunk) {
          this->_initialise();
        }

        virtual void _convertItems () override;
        virtual void _runAfterInitialization() const override;
        virtual void _runAfterFinalization() const override;
        virtual void _runAfterRebase() const override;

    <%# block copy formula %>
    <% if (block.copyType === "fixed") { %>
      <% if (block.copySize === undefined) { %>
        virtual inline long _maxCopySize() const override{return 0 ;}
      <% } else if (block.copySize < 0) { %>
        virtual inline long _maxCopySize() const override{return 0 ;}
      <% } else { %>
        virtual inline long _maxCopySize() const override{return <%- block.copySize %> ;}
      <% } %>

    <% } else if (block.copyType === "dynamic") { %>
        virtual long _maxCopySize() const override;
    <% } %>

    <%# block rebase formula %>
    <% if (block.rebaseNeeded === 'yes') { %>
        virtual const Block &_getRebaseBaseBlock() const override;
    <% } %>
  };
  <% }) %>

<%# footer %>
};
#endif
