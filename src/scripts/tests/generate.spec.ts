import generate from "../generate";
import createOrUpdateQueriesAndMutations from "../createOrUpdateQueriesAndMutations";
import generateCodeFromSchema from "../generateCodeFromSchema";
import generateIndexFile from "../generateIndexFile";
import transpileToJs from "../transpileToJs";

jest.mock("../createOrUpdateQueriesAndMutations");
jest.mock("../generateCodeFromSchema");
jest.mock("../generateIndexFile");
jest.mock("../transpileToJs");

describe("generate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should generate files successfully", async () => {
    const folder = "/some/folder";
    const generateJSFiles = true;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(true);
    (generateIndexFile as jest.Mock).mockResolvedValueOnce(true);

    await generate(folder, generateJSFiles);

    expect(createOrUpdateQueriesAndMutations).toHaveBeenCalledWith(folder);
    expect(generateCodeFromSchema).toHaveBeenCalledWith(folder);
    expect(generateIndexFile).toHaveBeenCalledWith(folder);
    expect(transpileToJs).toHaveBeenCalledWith(folder);
  });

  it("should throw error if queries and mutations creation fails", async () => {
    const folder = "/some/folder";
    const generateJSFiles = true;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(false);

    await expect(generate(folder, generateJSFiles)).rejects.toThrowError("Could not create or update the mutations and queries");
  });

  it("should throw error if code generation from schema fails", async () => {
    const folder = "/some/folder";
    const generateJSFiles = true;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(false);

    await expect(generate(folder, generateJSFiles)).rejects.toThrowError("Could not generate code from schema");
  });

  it("should throw error if index file generation fails", async () => {
    const folder = "/some/folder";
    const generateJSFiles = true;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(true);
    (generateIndexFile as jest.Mock).mockResolvedValueOnce(false);

    await expect(generate(folder, generateJSFiles)).rejects.toThrowError("Could not index file");
  });

  it("should not transpile to JS if generateJSFiles is false", async () => {
    const folder = "/some/folder";
    const generateJSFiles = false;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(true);
    (generateIndexFile as jest.Mock).mockResolvedValueOnce(true);

    await generate(folder, generateJSFiles);

    expect(transpileToJs).not.toHaveBeenCalled();
  });
});
