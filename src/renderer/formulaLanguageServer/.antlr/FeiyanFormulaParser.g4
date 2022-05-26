parser grammar FeiyanFormulaParser;
options {
  language = JavaScript;
  tokenVocab = FeiyanFormulaLexer;
}

formulaDefinition: statementSeq?;

// Expression

primaryExpression:
	literal+
	| This
	| LeftParen expression RightParen
	| idExpression
	| lambdaExpression;

idExpression: unqualifiedId | qualifiedId;

unqualifiedId:
	Identifier
	| operatorFunctionId
	| literalOperatorId;

qualifiedId: nestedNameSpecifier Template? unqualifiedId;

nestedNameSpecifier:
	(theTypeName | namespaceName | decltypeSpecifier)? Doublecolon
	| nestedNameSpecifier (
		Identifier
		| Template? simpleTemplateId
	) Doublecolon;

lambdaExpression:
	lambdaIntroducer lambdaDeclarator? compoundStatement;

lambdaIntroducer: LeftBracket lambdaCapture? RightBracket;

lambdaCapture:
	captureList
	| captureDefault (Comma captureList)?;

captureDefault: And | Assign;

captureList: capture (Comma capture)* Ellipsis?;

capture: simpleCapture | initcapture;

simpleCapture: And? Identifier | This;

initcapture: And? Identifier initializer;

lambdaDeclarator:
	LeftParen parameterDeclarationClause? RightParen Mutable? exceptionSpecification?
		attributeSpecifierSeq? trailingReturnType?;

postfixExpression:
	primaryExpression
	| postfixExpression LeftBracket (expression | bracedInitList) RightBracket
	| postfixExpression LeftParen expressionList? RightParen
	| simpleTypeSpecifier (
		LeftParen expressionList? RightParen
		| bracedInitList
	)
	| postfixExpression (Dot | Arrow) Template? idExpression
	| postfixExpression (PlusPlus | MinusMinus)
	| (
		Dynamic_cast
		| Static_cast
		| Reinterpret_cast
		| Const_cast
	) Less theTypeId Greater LeftParen expression RightParen;

expressionList: initializerList;

unaryExpression:
	postfixExpression
	| (PlusPlus | MinusMinus | unaryOperator ) unaryExpression
	| newExpression;

unaryOperator: Or | Star | And | Plus | Tilde | Minus | Not;

newExpression:
	Doublecolon? New newPlacement? (
		newTypeId
		| (LeftParen theTypeId RightParen)
	) newInitializer?;

newPlacement: LeftParen expressionList RightParen;

newTypeId: typeSpecifierSeq newDeclarator?;

newDeclarator:
	pointerOperator newDeclarator?
	| noPointerNewDeclarator;

noPointerNewDeclarator:
	LeftBracket expression RightBracket attributeSpecifierSeq?
	| noPointerNewDeclarator LeftBracket constantExpression RightBracket attributeSpecifierSeq?;

newInitializer:
	LeftParen expressionList? RightParen
	| bracedInitList;

castExpression:
	unaryExpression
	| LeftParen theTypeId RightParen castExpression;

pointerMemberExpression:
	castExpression ((DotStar | ArrowStar) castExpression)*;

multiplicativeExpression:
	pointerMemberExpression (
		(Star | Div | Mod) pointerMemberExpression
	)*;

additiveExpression:
	multiplicativeExpression (
		(Plus | Minus) multiplicativeExpression
	)*;

shiftExpression:
	additiveExpression (shiftOperator additiveExpression)*;

shiftOperator: Greater Greater | Less Less;

relationalExpression:
	shiftExpression (
		(Less | Greater | LessEqual | GreaterEqual) shiftExpression
	)*;

equalityExpression:
	relationalExpression (
		(Equal | NotEqual) relationalExpression
	)*;

andExpression: equalityExpression (And equalityExpression)*;

exclusiveOrExpression: andExpression (Caret andExpression)*;

inclusiveOrExpression:
	exclusiveOrExpression (Or exclusiveOrExpression)*;

logicalAndExpression:
	inclusiveOrExpression (AndAnd inclusiveOrExpression)*;

logicalOrExpression:
	logicalAndExpression (OrOr logicalAndExpression)*;

conditionalExpression:
	logicalOrExpression (
		Question expression Colon assignmentExpression
	)?;

assignmentExpression:
	conditionalExpression
	| logicalOrExpression assignmentOperator initializerClause
	| throwExpression;

assignmentOperator:
	Assign
	| StarAssign
	| DivAssign
	| ModAssign
	| PlusAssign
	| MinusAssign
	| RightShiftAssign
	| LeftShiftAssign
	| AndAssign
	| XorAssign
	| OrAssign;


expression: assignmentExpression (Comma assignmentExpression)*;

constantExpression: conditionalExpression;

// Statements

statement:
	labeledStatement
	| declarationStatement
	| expressionStatement
	| compoundStatement
	| selectionStatement
	| iterationStatement
	| jumpStatement;

labeledStatement:
	( Identifier
		| Case constantExpression
		| Default
	) Colon statement;

expressionStatement: expression? Semi;

compoundStatement: LeftBrace statementSeq? RightBrace;

statementSeq: statement+;

selectionStatement:
	If LeftParen condition RightParen statement (Else statement)?
	| Switch LeftParen condition RightParen statement;

condition:
	expression
	| attributeSpecifierSeq? declSpecifierSeq declarator (
		Assign initializerClause
		| bracedInitList
	);

iterationStatement:
	While LeftParen condition RightParen statement
	| Do statement While LeftParen expression RightParen Semi
	| For LeftParen (
		forInitStatement condition? Semi expression?
		| forRangeDeclaration Colon forRangeInitializer
	) RightParen statement;


forInitStatement: expressionStatement | simpleDeclaration;

forRangeDeclaration:
	attributeSpecifierSeq? declSpecifierSeq declarator;

forRangeInitializer: expression | bracedInitList;

jumpStatement:
	(
		Break
		| Continue
		| Return (expression | bracedInitList)?
		| Goto Identifier
	) Semi;

declarationStatement: blockDeclaration;

// Declarations

blockDeclaration: simpleDeclaration;

simpleDeclaration:
	declSpecifierSeq? initDeclaratorList? Semi
	| attributeSpecifierSeq declSpecifierSeq? initDeclaratorList Semi;

declSpecifier:
	typeSpecifier
	| functionSpecifier;

declSpecifierSeq: declSpecifier+? attributeSpecifierSeq?;


functionSpecifier: Inline | Virtual | Explicit;

typedefName: Identifier;

typeSpecifier:
	trailingTypeSpecifier
	| enumSpecifier;

trailingTypeSpecifier:
	simpleTypeSpecifier
	| cvQualifier;

typeSpecifierSeq: typeSpecifier+ attributeSpecifierSeq?;

trailingTypeSpecifierSeq:
	trailingTypeSpecifier+ attributeSpecifierSeq?;

simpleTypeLengthModifier:
	Short
	| Long;

simpleTypeSignednessModifier:
	Unsigned
	| Signed;

simpleTypeSpecifier:
	nestedNameSpecifier? theTypeName
	| simpleTypeSignednessModifier
	| simpleTypeSignednessModifier? simpleTypeLengthModifier+
	| simpleTypeSignednessModifier? Char
	| simpleTypeSignednessModifier? Char16
	| simpleTypeSignednessModifier? Char32
	| simpleTypeSignednessModifier? Wchar
	| Bool
	| simpleTypeSignednessModifier? simpleTypeLengthModifier* Int
	| Float
	| simpleTypeLengthModifier? Double
	| Void
	| Auto;

theTypeName:
	className
	| enumName
	| typedefName
	| simpleTemplateId;

decltypeSpecifier:
	Decltype LeftParen (expression | Auto) RightParen;

enumName: Identifier;

enumSpecifier:
	enumHead LeftBrace (enumeratorList Comma?)? RightBrace;

enumHead:
	enumkey attributeSpecifierSeq? Identifier? enumbase?;

opaqueEnumDeclaration:
	enumkey attributeSpecifierSeq? Identifier enumbase? Semi;

enumkey: Enum (Class | Struct)?;

enumbase: Colon typeSpecifierSeq;

enumeratorList:
	enumeratorDefinition (Comma enumeratorDefinition)*;

enumeratorDefinition: enumerator (Assign constantExpression)?;

enumerator: Identifier;

namespaceName: originalNamespaceName | namespaceAlias;

originalNamespaceName: Identifier;

namespaceAlias: Identifier;

attributeSpecifierSeq: attributeSpecifier+;

attributeSpecifier:
	LeftBracket LeftBracket attributeList? RightBracket RightBracket
	| alignmentspecifier;

alignmentspecifier:
	Alignas LeftParen (theTypeId | constantExpression) Ellipsis? RightParen;
	
attributeList: attribute (Comma attribute)* Ellipsis?;

attribute: (attributeNamespace Doublecolon)? Identifier attributeArgumentClause?;

attributeNamespace: Identifier;

attributeArgumentClause: LeftParen balancedTokenSeq? RightParen;

balancedTokenSeq: balancedtoken+;

balancedtoken:
	LeftParen balancedTokenSeq RightParen
	| LeftBracket balancedTokenSeq RightBracket
	| LeftBrace balancedTokenSeq RightBrace
	| ~(
		LeftParen
		| RightParen
		| LeftBrace
		| RightBrace
		| LeftBracket
		| RightBracket
	)+;

// Declarators

initDeclaratorList: initDeclarator (Comma initDeclarator)*;

initDeclarator: declarator initializer?;

declarator:
	pointerDeclarator
	| noPointerDeclarator parametersAndQualifiers trailingReturnType;

pointerDeclarator: (pointerOperator Const?)* noPointerDeclarator;

noPointerDeclarator:
	declaratorid attributeSpecifierSeq?
	| noPointerDeclarator (
		parametersAndQualifiers
		| LeftBracket constantExpression? RightBracket attributeSpecifierSeq?
	)
	| LeftParen pointerDeclarator RightParen;

parametersAndQualifiers:
	LeftParen parameterDeclarationClause? RightParen cvqualifierseq? refqualifier?
		exceptionSpecification? attributeSpecifierSeq?;

trailingReturnType:
	Arrow trailingTypeSpecifierSeq abstractDeclarator?;

pointerOperator:
	(And | AndAnd) attributeSpecifierSeq?
	| Star attributeSpecifierSeq? cvqualifierseq?;

cvqualifierseq: cvQualifier+;

cvQualifier: Const | Volatile;

refqualifier: And | AndAnd;

declaratorid: Ellipsis? idExpression;

theTypeId: typeSpecifierSeq abstractDeclarator?;

abstractDeclarator:
	pointerAbstractDeclarator
	| noPointerAbstractDeclarator? parametersAndQualifiers trailingReturnType
	| abstractPackDeclarator;

pointerAbstractDeclarator:
	noPointerAbstractDeclarator
	| pointerOperator+ noPointerAbstractDeclarator?;

noPointerAbstractDeclarator:
	noPointerAbstractDeclarator (
		parametersAndQualifiers
		| noPointerAbstractDeclarator LeftBracket constantExpression? RightBracket
			attributeSpecifierSeq?
	)
	| parametersAndQualifiers
	| LeftBracket constantExpression? RightBracket attributeSpecifierSeq?
	| LeftParen pointerAbstractDeclarator RightParen;

abstractPackDeclarator:
	pointerOperator* noPointerAbstractPackDeclarator;

noPointerAbstractPackDeclarator:
	noPointerAbstractPackDeclarator (
		parametersAndQualifiers
		| LeftBracket constantExpression? RightBracket attributeSpecifierSeq?
	)
	| Ellipsis;

parameterDeclarationClause:
	parameterDeclarationList (Comma? Ellipsis)?;

parameterDeclarationList:
	parameterDeclaration (Comma parameterDeclaration)*;

parameterDeclaration:
	attributeSpecifierSeq? declSpecifierSeq (
		(declarator | abstractDeclarator?) (
			Assign initializerClause
		)?
	);

initializer:
	braceOrEqualInitializer
	| LeftParen expressionList RightParen;

braceOrEqualInitializer:
	Assign initializerClause
	| bracedInitList;

initializerClause: assignmentExpression | bracedInitList;

initializerList:
	initializerClause Ellipsis? (
		Comma initializerClause Ellipsis?
	)*;

bracedInitList: LeftBrace (initializerList Comma?)? RightBrace;

// Classes

className: Identifier | simpleTemplateId;

// Overloading

operatorFunctionId: Operator theOperator;

literalOperatorId:
	Operator (
		StringLiteral Identifier
		| UserDefinedStringLiteral
	);

// Templates

simpleTemplateId:
	templateName Less templateArgumentList? Greater;

templateName: Identifier;

templateArgumentList:
	templateArgument Ellipsis? (Comma templateArgument Ellipsis?)*;

templateArgument: theTypeId | constantExpression | idExpression;

// Exception handling

throwExpression: Throw assignmentExpression?;

exceptionSpecification:
	dynamicExceptionSpecification
	| noeExceptSpecification;

dynamicExceptionSpecification:
	Throw LeftParen typeIdList? RightParen;

typeIdList: theTypeId Ellipsis? (Comma theTypeId Ellipsis?)*;

noeExceptSpecification:
	Noexcept LeftParen constantExpression RightParen
	| Noexcept;

// Lexers

theOperator:
	New (LeftBracket RightBracket)?
	| Delete (LeftBracket RightBracket)?
	| Plus
	| Minus
	| Star
	| Div
	| Mod
	| Caret
	| And
	| Or
	| Tilde
	| Not
	| Assign
	| Greater
	| Less
	| GreaterEqual
	| PlusAssign
	| MinusAssign
	| StarAssign
	| ModAssign
	| XorAssign
	| AndAssign
	| OrAssign
	| Less Less
	| Greater Greater
	| RightShiftAssign
	| LeftShiftAssign
	| Equal
	| NotEqual
	| LessEqual
	| AndAnd
	| OrOr
	| PlusPlus
	| MinusMinus
	| Comma
	| ArrowStar
	| Arrow
	| LeftParen RightParen
	| LeftBracket RightBracket;

literal:
	IntegerLiteral
	| CharacterLiteral
	| FloatingLiteral
	| StringLiteral
	| BooleanLiteral
	| PointerLiteral
	| UserDefinedLiteral;