import type * as ts from 'typescript/lib/tsserverlibrary';

// ==============================================
// 型定義
// ==============================================

/**
 * プラグイン初期化時に渡されるTypeScriptモジュール
 */
interface TypeScriptModules {
  readonly typescript: typeof ts;
}

/**
 * プロパティ情報を表す型
 */
interface PropertyInfo {
  readonly name: string;
  readonly type: string;
  readonly optional: boolean;
}

/**
 * 操作結果を表すResult型
 */
type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * JSDocコメント部分の型
 */
type JSDocComment = string | ts.NodeArray<ts.JSDocComment>;

/**
 * JSDocコメント要素の型
 */
interface JSDocCommentPart {
  readonly text?: string;
}

// ==============================================
// ユーティリティ関数
// ==============================================

/**
 * Result型のSuccessを作成
 */
const success = <T>(data: T): Result<T> => ({ success: true, data });

/**
 * Result型のErrorを作成
 */
const failure = <T>(error: Error): Result<T> => ({ success: false, error });

/**
 * Resultの値を安全に抽出
 */
const getResultData = <T>(result: Result<T>): T | undefined =>
  result.success ? result.data : undefined;

/**
 * 配列からResultの成功値のみを抽出
 */
const extractSuccessResults = <T>(results: Result<T>[]): T[] =>
  results.map(getResultData).filter((item): item is T => item !== undefined);

// ==============================================
// 型ガード関数
// ==============================================

/**
 * 値がJSDocCommentPartかどうかを判定する型ガード
 */
const isJSDocCommentPart = (value: unknown): value is JSDocCommentPart =>
  typeof value === 'object' && value !== null && 'text' in value;

// ==============================================
// コア関数
// ==============================================

/**
 * 指定された位置のノードを検索する
 */
const findNodeAtPosition = (
  sourceFile: ts.SourceFile,
  position: number,
  typescript: typeof ts,
): Result<ts.Node> => {
  try {
    const visitNode = (node: ts.Node): ts.Node | undefined => {
      if (position >= node.getStart() && position <= node.getEnd()) {
        return typescript.forEachChild(node, visitNode) ?? node;
      }
      return undefined;
    };

    const foundNode = visitNode(sourceFile);
    return foundNode ? success(foundNode) : failure(new Error('Node not found at position'));
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error('Unknown error in findNodeAtPosition'),
    );
  }
};

/**
 * ノードの親TypeAliasDeclarationを検索する
 */
const findParentTypeAlias = (
  node: ts.Node,
  typescript: typeof ts,
): Result<ts.TypeAliasDeclaration> => {
  try {
    let current: ts.Node | undefined = node;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (current) {
      if (typescript.isTypeAliasDeclaration(current)) {
        return success(current);
      }
      current = current.parent;
    }

    return failure(new Error('TypeAliasDeclaration not found in parent chain'));
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error('Unknown error in findParentTypeAlias'),
    );
  }
};

/**
 * JSDocコメントを文字列に変換する
 */
const convertJSDocCommentToString = (comment: JSDocComment): string => {
  if (typeof comment === 'string') {
    return comment;
  }

  if (Array.isArray(comment)) {
    return comment.map(part => (isJSDocCommentPart(part) ? part.text || '' : '')).join('');
  }

  return '';
};

/**
 * @implementsタグからインターフェース名を抽出する
 */
const extractImplementsInterfaces = (
  typeAlias: ts.TypeAliasDeclaration,
  typescript: typeof ts,
): Result<readonly string[]> => {
  try {
    const jsDocTags = typescript.getJSDocTags(typeAlias);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!jsDocTags?.length) {
      return success([]);
    }

    const implementsTags = jsDocTags.filter(
      tag => String(tag.tagName.escapedText) === 'implements',
    );

    const interfaces = implementsTags
      .map(tag => {
        if (!tag.comment) return undefined;

        const comment = convertJSDocCommentToString(tag.comment);
        const match = /\{([^}]+)\}/.exec(comment);

        return match?.[1]?.trim();
      })
      .filter((name): name is string => Boolean(name));

    return success(interfaces);
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error('Error extracting implements interfaces'),
    );
  }
};

/**
 * TypeAliasの既存プロパティを取得する
 */
const getExistingProperties = (
  typeAlias: ts.TypeAliasDeclaration,
  typescript: typeof ts,
): Result<ReadonlySet<string>> => {
  try {
    const properties = new Set<string>();

    if (!typescript.isTypeLiteralNode(typeAlias.type)) {
      return success(properties);
    }

    const members = typeAlias.type.members;

    for (const member of members) {
      if (!typescript.isPropertySignature(member)) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!member.name) {
        continue;
      }

      if (typescript.isIdentifier(member.name)) {
        properties.add(member.name.text);
      } else if (typescript.isStringLiteral(member.name)) {
        properties.add(member.name.text);
      }
    }

    return success(properties);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error('Error getting existing properties'));
  }
};

/**
 * ソースファイル内でインターフェース宣言を検索する
 */
const findInterfaceDeclaration = (
  sourceFile: ts.SourceFile,
  interfaceName: string,
  typescript: typeof ts,
): ts.InterfaceDeclaration | undefined => {
  const visit = (node: ts.Node): ts.InterfaceDeclaration | undefined => {
    if (typescript.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      return node;
    }
    return typescript.forEachChild(node, visit);
  };
  return visit(sourceFile);
};

/**
 * プログラム全体でインターフェース宣言を検索する
 */
const findInterfaceInProgram = (
  interfaceName: string,
  program: ts.Program,
  typescript: typeof ts,
): ts.InterfaceDeclaration | undefined => {
  for (const sourceFile of program.getSourceFiles()) {
    // node_modulesファイルはスキップ
    if (sourceFile.fileName.includes('node_modules')) {
      continue;
    }
    
    const interfaceDecl = findInterfaceDeclaration(sourceFile, interfaceName, typescript);
    if (interfaceDecl) {
      return interfaceDecl;
    }
  }
  return undefined;
};

/**
 * TypeCheckerを使ってインターフェースシンボルを検索する
 */
const findInterfaceBySymbol = (
  interfaceName: string,
  sourceFile: ts.SourceFile,
  program: ts.Program,
  typescript: typeof ts,
): ts.InterfaceDeclaration | undefined => {
  const typeChecker = program.getTypeChecker();
  
  // モジュール内の exports を検索
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (moduleSymbol?.exports) {
    const interfaceSymbol = moduleSymbol.exports.get(interfaceName as ts.__String);
    if (interfaceSymbol?.valueDeclaration && typescript.isInterfaceDeclaration(interfaceSymbol.valueDeclaration)) {
      return interfaceSymbol.valueDeclaration;
    }
  }
  
  // グローバルスコープで検索
  const globalSymbol = typeChecker.resolveName(interfaceName, sourceFile, typescript.SymbolFlags.Interface, false);
  if (globalSymbol?.valueDeclaration && typescript.isInterfaceDeclaration(globalSymbol.valueDeclaration)) {
    return globalSymbol.valueDeclaration;
  }
  
  return undefined;
};

/**
 * インターフェースのプロパティ情報を取得する
 */
const getInterfaceProperties = (
  interfaceName: string,
  sourceFile: ts.SourceFile,
  languageService: ts.LanguageService,
  typescript: typeof ts,
): Result<readonly PropertyInfo[]> => {
  try {
    const program = languageService.getProgram();
    if (!program) {
      return failure(new Error('Program not available'));
    }

    const typeChecker = program.getTypeChecker();

    // 複数の方法でインターフェース宣言を検索
    let interfaceDeclaration: ts.InterfaceDeclaration | undefined;

    // 1. 同一ファイル内を検索
    interfaceDeclaration = findInterfaceDeclaration(sourceFile, interfaceName, typescript);
    
    // 2. TypeCheckerのシンボル解決を使用
    interfaceDeclaration ??= findInterfaceBySymbol(interfaceName, sourceFile, program, typescript);

    // 3. プログラム全体を検索
    interfaceDeclaration ??= findInterfaceInProgram(interfaceName, program, typescript);

    if (!interfaceDeclaration) {
      return failure(new Error(`Interface ${interfaceName} not found anywhere in the program`));
    }

    // インターフェースの型を取得
    const interfaceType = typeChecker.getTypeAtLocation(interfaceDeclaration);
    const typeProperties = typeChecker.getPropertiesOfType(interfaceType);

    const properties: PropertyInfo[] = typeProperties.map(property => {
      const propertyType = typeChecker.getTypeOfSymbolAtLocation(property, interfaceDeclaration);
      const typeString = typeChecker.typeToString(propertyType);
      const isOptional = Boolean(property.flags & typescript.SymbolFlags.Optional);

      return {
        name: property.name,
        type: typeString,
        optional: isOptional,
      };
    });

    return success(properties);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error
        : new Error(`Error getting interface properties for ${interfaceName}`),
    );
  }
};

/**
 * 補完エントリを作成する
 */
const createCompletionEntry = (
  property: PropertyInfo,
  interfaceName: string,
  typescript: typeof ts,
): ts.CompletionEntry => ({
  name: property.name,
  kind: typescript.ScriptElementKind.memberVariableElement,
  kindModifiers: property.optional ? typescript.ScriptElementKindModifier.optionalModifier : '',
  sortText: `0${property.name}`, // 高い優先度
  insertText: `${property.name}: ${property.type}`,
  source: `@implements ${interfaceName}`,
});

/**
 * インターフェース実装用の補完候補を生成する
 */
const getImplementsCompletions = (
  sourceFile: ts.SourceFile,
  position: number,
  languageService: ts.LanguageService,
  typescript: typeof ts,
): readonly ts.CompletionEntry[] => {
  try {
    // デバッグログ: プラグインが呼び出されたことを確認
    console.log('[TS Plugin] getImplementsCompletions called at position:', position);

    // ノード検索
    const nodeResult = findNodeAtPosition(sourceFile, position, typescript);
    if (!nodeResult.success) {
      console.log('[TS Plugin] Node not found at position');
      return [];
    }
    console.log('[TS Plugin] Found node:', typescript.SyntaxKind[nodeResult.data.kind]);

    // TypeAlias検索
    const typeAliasResult = findParentTypeAlias(nodeResult.data, typescript);
    if (!typeAliasResult.success) {
      console.log('[TS Plugin] TypeAlias not found in parent chain');
      return [];
    }
    console.log('[TS Plugin] Found TypeAlias:', typeAliasResult.data.name.text);

    // @implementsインターフェース抽出
    const interfacesResult = extractImplementsInterfaces(typeAliasResult.data, typescript);
    if (!interfacesResult.success || interfacesResult.data.length === 0) {
      console.log('[TS Plugin] No @implements interfaces found');
      return [];
    }
    console.log('[TS Plugin] Found @implements interfaces:', interfacesResult.data);

    // 既存プロパティ取得
    const existingPropsResult = getExistingProperties(typeAliasResult.data, typescript);
    if (!existingPropsResult.success) {
      console.log('[TS Plugin] Failed to get existing properties');
      return [];
    }
    console.log('[TS Plugin] Existing properties:', Array.from(existingPropsResult.data));

    // 各インターフェースのプロパティを取得して補完エントリを作成
    const completionResults: Result<{
      interfaceName: string;
      properties: readonly PropertyInfo[];
    }>[] = interfacesResult.data.map(interfaceName => {
      const propertiesResult = getInterfaceProperties(
        interfaceName,
        sourceFile,
        languageService,
        typescript,
      );
      if (propertiesResult.success) {
        console.log(`[TS Plugin] Interface ${interfaceName} properties:`, propertiesResult.data);
      } else {
        console.log(`[TS Plugin] Failed to get properties for ${interfaceName}:`, propertiesResult.error);
      }
      return propertiesResult.success
        ? success({
            interfaceName,
            properties: propertiesResult.data,
          })
        : failure(new Error(`Failed to get properties for ${interfaceName}`));
    });

    const successfulResults = extractSuccessResults(completionResults);

    const completions: ts.CompletionEntry[] = successfulResults.flatMap(
      ({ interfaceName, properties }) =>
        properties
          .filter((prop: PropertyInfo) => !existingPropsResult.data.has(prop.name))
          .map((prop: PropertyInfo) => createCompletionEntry(prop, interfaceName, typescript)),
    );

    console.log('[TS Plugin] Generated completions:', completions.map(c => c.name));
    return completions;
  } catch (error) {
    console.error('[TS Plugin] Error in getImplementsCompletions:', error);
    return [];
  }
};

/**
 * Language Serviceのプロキシを作成する
 */
const createLanguageServiceProxy = (
  originalService: ts.LanguageService,
  typescript: typeof ts,
): ts.LanguageService => {
  console.log('[TS Plugin] Creating language service proxy');
  
  return {
    ...originalService,
    getCompletionsAtPosition: (
      fileName: string,
      position: number,
      options: ts.GetCompletionsAtPositionOptions | undefined,
    ) => {
      console.log(`[TS Plugin] getCompletionsAtPosition called for file: ${fileName} at position: ${String(position)}`);
      
      const originalCompletions = originalService.getCompletionsAtPosition(
        fileName,
        position,
        options,
      );

      const sourceFile = originalService.getProgram()?.getSourceFile(fileName);
      if (!sourceFile) {
        console.log('[TS Plugin] Source file not found');
        return originalCompletions;
      }

      const implementsCompletions = getImplementsCompletions(
        sourceFile,
        position,
        originalService,
        typescript,
      );

      if (implementsCompletions.length === 0) {
        console.log('[TS Plugin] No implements completions found');
        return originalCompletions;
      }

      console.log(`[TS Plugin] Found ${String(implementsCompletions.length)} implements completions`);

      if (!originalCompletions) {
        return {
          isGlobalCompletion: false,
          isMemberCompletion: false,
          isNewIdentifierLocation: false,
          entries: [...implementsCompletions],
        };
      }

      return {
        ...originalCompletions,
        entries: [...originalCompletions.entries, ...implementsCompletions],
      };
    },
  };
};

// ==============================================
// プラグインエントリポイント
// ==============================================

/**
 * TypeScript Language Server Pluginのメイン関数
 */
function init(modules: TypeScriptModules): ts.server.PluginModule {
  console.log('[TS Plugin] Plugin initialized successfully');
  
  const typescript = modules.typescript;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    console.log('[TS Plugin] Language service proxy created');
    console.log('[TS Plugin] Plugin config:', info.config);
    return createLanguageServiceProxy(info.languageService, typescript);
  }

  return { create };
}

// TypeScript Language Server Plugin standard export
module.exports = init;
