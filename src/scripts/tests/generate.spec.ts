import generate from "../generate";
import createOrUpdateQueriesAndMutations from "../createOrUpdateQueriesAndMutations";
import generateCodeFromSchema from "../generateCodeFromSchema";
import generateFiles from "../generateFiles";
import transpileToJs from "../transpileToJs";
import { installDependencies } from "../../helpers/install-dependencies";

jest.mock("../createOrUpdateQueriesAndMutations");
jest.mock("../generateCodeFromSchema");
jest.mock("../generateFiles");
jest.mock("../transpileToJs");
jest.mock("../../helpers/install-dependencies");

describe("generate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should generate files successfully", async () => {
    const folder = "/some/folder";
    const generateJSFiles = true;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(true);
    (generateFiles as jest.Mock).mockResolvedValueOnce(true);
    (transpileToJs as jest.Mock).mockResolvedValueOnce(true);
    (installDependencies as jest.Mock).mockResolvedValueOnce({success: true, message: "Deps Installed"})

    await generate(folder, generateJSFiles);

    expect(createOrUpdateQueriesAndMutations).toHaveBeenCalledWith(folder);
    expect(generateCodeFromSchema).toHaveBeenCalledWith(folder);
    expect(generateFiles).toHaveBeenCalledWith(folder);
    expect(installDependencies).toHaveBeenCalled();
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
    (generateFiles as jest.Mock).mockResolvedValueOnce(false);

    await expect(generate(folder, generateJSFiles)).rejects.toThrowError("Could not generate files");
  });

  it("should not transpile to JS if generateJSFiles is false", async () => {
    const folder = "/some/folder";
    const generateJSFiles = false;

    (createOrUpdateQueriesAndMutations as jest.Mock).mockResolvedValueOnce(true);
    (generateCodeFromSchema as jest.Mock).mockResolvedValueOnce(true);
    (generateFiles as jest.Mock).mockResolvedValueOnce(true);
    (installDependencies as jest.Mock).mockResolvedValueOnce({success: true, message: "Deps Installed"})

    await generate(folder, generateJSFiles);

    expect(transpileToJs).not.toHaveBeenCalled();
  });
});
